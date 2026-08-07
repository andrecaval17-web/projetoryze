import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GEO_PAGE_TYPES, getGeoPageType } from "@/lib/geo/page-types";
import { getGeoCity, listGeoCities } from "@/lib/geo/cities";
import { GeoPageTemplate } from "@/components/sections/geo-page-template";
import { buildPageMetadata } from "@/lib/seo";

interface GeoParams {
  tipo: string;
  uf: string;
  cidade: string;
}

// ISR diária — o conteúdo depende só do cadastro em `geo_cities`, que não
// muda de um dia pro outro. `dynamicParams = true` é o que permite o lote
// completo (Fase 2) existir sem novo build: basta cadastrar a cidade no
// Supabase e a primeira visita gera a página sob demanda.
export const revalidate = 86400;
export const dynamicParams = true;

// Cada tipo controla seu próprio estágio via `status` (ver GeoBatchStatus em
// lib/geo/page-types.ts): "prototype" só pré-renderа Vitória/ES (assim entra
// um tipo novo em revisão sem virar lote); "batch" pré-renderа todas as
// cidades ativas em `geo_cities`. Hoje: os 4 tipos B2C ficam "prototype"
// (pausados desde 2026-08-07); os 4 primeiros tipos B2B são "batch" (piloto
// Tier 1 aprovado); "Cargos e Salários" é o 5º tipo, ainda "prototype".
export async function generateStaticParams(): Promise<GeoParams[]> {
  const prototypeTypes = GEO_PAGE_TYPES.filter((type) => type.status === "prototype");
  const prototypeParams = prototypeTypes.map((type) => ({
    tipo: type.slug,
    uf: "es",
    cidade: "vitoria",
  }));

  const batchTypes = GEO_PAGE_TYPES.filter((type) => type.status === "batch");
  const cities = await listGeoCities();
  const batchParams = batchTypes.flatMap((type) =>
    cities.map((city) => ({ tipo: type.slug, uf: city.uf, cidade: city.slug }))
  );

  return [...prototypeParams, ...batchParams];
}

async function resolveGeoPage(paramsPromise: Promise<GeoParams>) {
  const { tipo, uf, cidade } = await paramsPromise;
  const pageType = getGeoPageType(tipo);
  if (!pageType) return null;

  const city = await getGeoCity(uf, cidade);
  if (!city) return null;

  return { pageType, city };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<GeoParams>;
}): Promise<Metadata> {
  const resolved = await resolveGeoPage(params);
  if (!resolved) return {};

  const { pageType, city } = resolved;
  return buildPageMetadata({
    title: pageType.buildTitle(city),
    description: pageType.buildDescription(city),
    path: `/${pageType.slug}/${city.uf}/${city.slug}`,
    ogImageAlt: pageType.buildH1(city),
  });
}

export default async function GeoServicePage({ params }: { params: Promise<GeoParams> }) {
  const resolved = await resolveGeoPage(params);
  if (!resolved) notFound();

  const { pageType, city } = resolved;
  const otherCities = await listGeoCities();

  return <GeoPageTemplate city={city} pageType={pageType} otherCities={otherCities} />;
}
