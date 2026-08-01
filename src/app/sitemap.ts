import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
