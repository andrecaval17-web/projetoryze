import { getResendClient } from "./client";

// Mesmo fallback dos outros envios do projeto — sem `RESEND_FROM_EMAIL` com
// domínio verificado, `onboarding@resend.dev` só entrega pro dono da conta
// Resend (ver HANDOFF.md). Até esse domínio ser verificado, este e-mail
// pode não chegar de fato em `comercial@ryzerh.com.br` — o lead já está
// salvo em `leads` independente disso (ver actions.ts), que é o dado que
// não pode se perder.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Ryze <onboarding@resend.dev>";

const SALES_INBOX = "comercial@ryzerh.com.br";

const URGENCY_LABELS: Record<string, string> = {
  imediata: "Imediata",
  ate_30_dias: "Até 30 dias",
  pesquisando: "Só pesquisando",
};

export interface RecruitmentLeadDetails {
  name: string;
  company: string;
  phone: string;
  role: string;
  urgency: string;
}

// Todo campo abaixo é texto livre digitado pelo visitante — nunca
// interpolar direto no HTML do e-mail sem escapar, senão um nome como
// `<img src=x onerror=...>` ou um link disfarçado de cargo vira HTML/script
// de verdade na caixa de entrada de quem recebe.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Aviso imediato pro time comercial de um novo lead de Recrutamento e
 * Seleção (formulário em /consultoria/recrutamento-e-selecao). Mesmo padrão
 * de sendRejectionEmail/sendWhatsappInviteEmail: lança em caso de erro do
 * Resend — quem chama (ver actions.ts) é responsável por capturar e nunca
 * deixar isso impedir ou atrasar a resposta ao visitante, já que o lead é
 * salvo em `leads` antes desta chamada.
 */
export async function sendRecruitmentLeadEmail(details: RecruitmentLeadDetails): Promise<void> {
  const resend = getResendClient();

  if (!resend) {
    console.warn("[email] RESEND_API_KEY não configurada — aviso de lead não enviado.");
    return;
  }

  // `urgencyLabel` vem de URGENCY_LABELS (catálogo fixo interno) — nunca do
  // visitante, não precisa escapar. Os demais campos vêm direto do
  // formulário público.
  const urgencyLabel = URGENCY_LABELS[details.urgency] ?? details.urgency;
  const name = escapeHtml(details.name);
  const company = escapeHtml(details.company);
  const phone = escapeHtml(details.phone);
  const role = escapeHtml(details.role);

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: SALES_INBOX,
    subject: `Novo lead — Recrutamento e Seleção: ${details.company}`,
    html: `
      <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2E2C2A; line-height: 1.5;">
        <h1 style="font-size: 20px; margin-bottom: 12px;">Novo lead de Recrutamento e Seleção</h1>
        <p>Veio pelo formulário de <strong>/consultoria/recrutamento-e-selecao</strong>.</p>
        <table style="margin: 20px 0; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #6B6864;">Nome</td><td style="padding: 4px 0;"><strong>${name}</strong></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #6B6864;">Empresa</td><td style="padding: 4px 0;"><strong>${company}</strong></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #6B6864;">WhatsApp</td><td style="padding: 4px 0;"><strong>${phone}</strong></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #6B6864;">Cargo a contratar</td><td style="padding: 4px 0;"><strong>${role}</strong></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #6B6864;">Urgência</td><td style="padding: 4px 0;"><strong>${urgencyLabel}</strong></td></tr>
        </table>
        <p style="color: #6B6864; font-size: 13px;">Também salvo em /admin/leads.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
