/**
 * Catálogo fechado de botões de WhatsApp rastreados em `whatsapp_clicks` —
 * usado tanto pelo client (WhatsappClickLink) quanto pelo endpoint que grava
 * (src/app/api/whatsapp-click/route.ts), que rejeita qualquer valor fora
 * desta lista antes de gravar. `page_path` (de onde veio o clique) já
 * diferencia a página — este identificador é só "qual botão", não "qual
 * página".
 */
export const WHATSAPP_CLICK_BUTTONS = [
  /** Botão flutuante presente em todas as páginas (layout raiz). */
  "floating",
  /** "Falar com especialista" no cabeçalho (desktop e mobile). */
  "navbar",
  /** Link "Contato" no rodapé. */
  "footer",
  /** CTA principal já no topo/hero de uma página (consultoria, empresas,
   *  produtos, páginas geo B2B). */
  "hero_primary",
  /** Botão secundário "Falar no WhatsApp" nas páginas geo B2C (quando o CTA
   *  principal não é o WhatsApp). */
  "hero_secondary",
  /** CtaBand de fechamento (um único CTA no fim da página). */
  "cta_band",
  /** DualCtaBand — "Falar com especialista" (academy/cultura). */
  "dual_cta_primary",
  /** DualCtaBand — "Agendar demonstração" (academy/cultura). */
  "dual_cta_secondary",
  /** Botão de WhatsApp na tela de confirmação do formulário de lead. */
  "lead_form_success",
] as const;

export type WhatsappClickButton = (typeof WHATSAPP_CLICK_BUTTONS)[number];

const PAGE_PATH_PATTERN = /^\/[a-zA-Z0-9\-_/]{0,200}$/;

export function isValidWhatsappClickButton(value: unknown): value is WhatsappClickButton {
  return typeof value === "string" && (WHATSAPP_CLICK_BUTTONS as readonly string[]).includes(value);
}

export function isValidPagePath(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && PAGE_PATH_PATTERN.test(value);
}
