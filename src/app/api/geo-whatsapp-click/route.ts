import { getSupabasePublicClient } from "@/lib/supabase/public";
import { GEO_PAGE_TYPES } from "@/lib/geo/page-types";

// uf: sigla de 2 letras minúsculas (ex: "ba"). city_slug: mesmo formato de
// slug usado em geo_cities/na URL — letras minúsculas, dígitos e hífen,
// com um teto de tamanho só pra rejeitar lixo cedo, sem depender do banco.
const UF_PATTERN = /^[a-z]{2}$/;
const CITY_SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

/**
 * Alvo do beacon disparado por GeoWhatsappCtaLink — nunca deve derrubar o
 * clique real do visitante nem vazar erro pra ele: sempre responde 204,
 * mesmo quando o payload é inválido, a tabela `geo_whatsapp_clicks` ainda
 * não existe em produção (deploy pode ir ao ar antes da migration rodar) ou
 * o insert falha por qualquer outro motivo. Válida page_type contra o
 * catálogo real de GEO_PAGE_TYPES antes de gravar — é o que evita a tabela
 * virar lixo pra qualquer POST arbitrário.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pageType = typeof body?.page_type === "string" ? body.page_type : "";
    const uf = typeof body?.uf === "string" ? body.uf : "";
    const citySlug = typeof body?.city_slug === "string" ? body.city_slug : "";
    const pagePath = typeof body?.page_path === "string" ? body.page_path.slice(0, 200) : "";

    const isValid =
      GEO_PAGE_TYPES.some((t) => t.slug === pageType) &&
      UF_PATTERN.test(uf) &&
      CITY_SLUG_PATTERN.test(citySlug);

    if (isValid) {
      const supabase = getSupabasePublicClient();
      await supabase.from("geo_whatsapp_clicks").insert({
        page_type: pageType,
        uf,
        city_slug: citySlug,
        page_path: pagePath || `/${pageType}/${uf}/${citySlug}`,
      });
    }
  } catch (err) {
    console.error("[geo-whatsapp-click] falha ao registrar clique", err);
  }

  return new Response(null, { status: 204 });
}
