/**
 * Domínio de produção ainda não está configurado em nenhum lugar do projeto
 * (nem .env, nem vercel.json) — sem isso, sitemap/robots/canonical/OG
 * cairiam pro fallback de localhost em produção, gerando URLs erradas nos
 * metadados. Configure `NEXT_PUBLIC_SITE_URL` assim que o domínio real for
 * definido.
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
