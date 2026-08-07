import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { GEO_PAGE_TYPES } from "@/lib/geo/page-types";
import { listGeoCities } from "@/lib/geo/cities";

// Só rotas públicas com conteúdo estável valem sitemap — de fora ficam
// fluxos de autenticação, painel do candidato (autenticado), admin/ATS
// interno, /design-system e /vagas/[slug] (já marcada noindex, gerada
// dinamicamente por vaga aberta).
const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/empresas", priority: 0.9, changeFrequency: "monthly" },
  { path: "/produtos", priority: 0.9, changeFrequency: "monthly" },
  { path: "/produtos/academy", priority: 0.8, changeFrequency: "monthly" },
  { path: "/produtos/cultura", priority: 0.8, changeFrequency: "monthly" },
  { path: "/consultoria", priority: 0.9, changeFrequency: "monthly" },
  { path: "/consultoria/recrutamento-e-selecao", priority: 0.7, changeFrequency: "monthly" },
  { path: "/consultoria/cargos-e-salarios", priority: 0.7, changeFrequency: "monthly" },
  { path: "/consultoria/treinamento-e-desenvolvimento", priority: 0.7, changeFrequency: "monthly" },
  { path: "/consultoria/cultura-organizacional", priority: 0.7, changeFrequency: "monthly" },
  { path: "/para-candidatos", priority: 0.8, changeFrequency: "monthly" },
  { path: "/vagas", priority: 0.7, changeFrequency: "daily" },
  { path: "/contato", priority: 0.6, changeFrequency: "yearly" },
  { path: "/sobre", priority: 0.5, changeFrequency: "yearly" },
  { path: "/termos", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacidade", priority: 0.2, changeFrequency: "yearly" },
];

// Só tipos com status "batch" entram no sitemap (ver GeoBatchStatus em
// lib/geo/page-types.ts) — protótipos em revisão (todo o B2C, e qualquer
// tipo B2B novo ainda não aprovado) ficam de propósito fora da indexação
// até terem sua expansão aprovada. Prioridade desce por tier (1 =
// capitais/grandes centros, 3 = municípios menores).
const GEO_PRIORITY_BY_TIER: Record<number, number> = { 1: 0.7, 2: 0.5, 3: 0.4 };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const staticEntries = routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const batchTypes = GEO_PAGE_TYPES.filter((type) => type.status === "batch");
  const cities = await listGeoCities();
  const geoEntries = batchTypes.flatMap((type) =>
    cities.map((city) => ({
      url: `${siteUrl}/${type.slug}/${city.uf}/${city.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: GEO_PRIORITY_BY_TIER[city.tier] ?? 0.4,
    }))
  );

  return [...staticEntries, ...geoEntries];
}
