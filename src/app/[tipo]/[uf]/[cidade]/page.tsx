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

// B2C fica pausado no protótipo (só Vitória/ES) — combinado em 2026-08-07,
// não avançar pro lote completo até o B2B estar validado. B2B já é o piloto
// Tier 1 de verdade: todas as cidades ativas em `geo_cities` (ES completo +
// as 5 metrópoles aprovadas) × os 4 tipos B2B, pré-renderadas no build.
export async function generateStaticParams(): Promise<GeoParams[]> {
  const b2cPrototype = GEO_PAGE_TYPES.filter((type) => type.audience === "b2c").map((type) => ({
    tipo: type.slug,
    uf: "es",
    cidade: "vitoria",
  }));

  const b2bTypes = GEO_PAGE_TYPES.filter((type) => type.audience === "b2b");
  const cities = await listGeoCities();
  const b2bBatch = b2bTypes.flatMap((type) =>
    cities.map((city) => ({ tipo: type.slug, uf: city.uf, cidade: city.slug }))
  );

  return [...b2cPrototype, ...b2bBatch];
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
