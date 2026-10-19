import { getSupabasePublicClient } from "@/lib/supabase/public";
import { isValidWhatsappClickButton, isValidPagePath } from "@/lib/whatsapp-click";

/**
 * Alvo do beacon disparado por WhatsappClickLink — nunca deve derrubar o
 * clique real do visitante nem vazar erro pra ele: sempre responde 204,
 * mesmo quando o payload é inválido, a tabela `whatsapp_clicks` ainda não
 * existe em produção (deploy pode ir ao ar antes da migration rodar) ou o
 * insert falha por qualquer outro motivo. Válida `button` contra o
 * catálogo fechado de WHATSAPP_CLICK_BUTTONS e `page_path` contra um
 * formato razoável antes de gravar — é o que evita a tabela virar lixo pra
 * qualquer POST arbitrário.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const button = body?.button;
    const pagePath = body?.page_path;

    if (isValidWhatsappClickButton(button) && isValidPagePath(pagePath)) {
      const supabase = getSupabasePublicClient();
      await supabase.from("whatsapp_clicks").insert({ button, page_path: pagePath });
    }
  } catch (err) {
    console.error("[whatsapp-click] falha ao registrar clique", err);
  }

  return new Response(null, { status: 204 });
}
