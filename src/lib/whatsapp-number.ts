/** Número de WhatsApp da Ryze — único ponto de verdade, usado pelo botão flutuante e por qualquer CTA de WhatsApp no site (ex: páginas geo). */
export const WHATSAPP_NUMBER = "5527988881302";

/**
 * Monta o link wa.me com mensagem pré-preenchida no formato padrão pedido
 * pelo André em 2026-08-12: substitui os CTAs "Falar com um especialista"
 * que apontavam para o formulário de /contato (com erro de envio) por um
 * redirecionamento direto ao WhatsApp, contextualizado com a página/serviço
 * que a pessoa estava vendo.
 */
export function buildContactWhatsappHref(topic: string): string {
  const message = `Olá Ryze RH, quero falar com um especialista sobre ${topic}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Mesma lógica do buildContactWhatsappHref, mas para os CTAs "Agendar
 * demonstração" — que também apontavam pro /contato quebrado (2026-09-03).
 * Frase usa "para conhecer" (em vez de "de"/"da") pra evitar problema de
 * contração de preposição com os diferentes tópicos passados.
 */
export function buildDemoWhatsappHref(topic: string): string {
  const message = `Olá Ryze RH, quero agendar uma demonstração para conhecer ${topic}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
