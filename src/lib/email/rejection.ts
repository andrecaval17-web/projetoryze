import { getResendClient } from "./client";

// Mesmo fallback do convite de WhatsApp — sem `RESEND_FROM_EMAIL` configurado
// com domínio verificado, `onboarding@resend.dev` só entrega pro dono da
// conta Resend. Ver `src/lib/email/whatsapp-invite.ts`.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Ryze <onboarding@resend.dev>";

/**
 * Aviso de rejeição, disparado uma única vez por candidatura (ver
 * `maybeSendRejectionEmail` em src/lib/ats/rejection-email.ts, que garante
 * isso antes de chamar aqui) — nunca lança: quem chama decide como reagir a
 * uma falha de envio, e o e-mail não pode travar a atualização de status no
 * painel admin.
 */
export async function sendRejectionEmail(to: string, name: string, jobTitle: string, vagasLink: string): Promise<void> {
  const resend = getResendClient();

  if (!resend) {
    console.warn("[email] RESEND_API_KEY não configurada — e-mail de rejeição não enviado.");
    return;
  }
  if (!to) return;

  const firstName = name.trim().split(" ")[0];
  const greeting = firstName ? `Olá, ${firstName},` : "Olá,";

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Sobre sua candidatura — ${jobTitle}`,
    html: `
      <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2E2C2A; line-height: 1.5;">
        <h1 style="font-size: 20px; margin-bottom: 12px;">${greeting}</h1>
        <p>Obrigado por participar do processo seletivo para a vaga de <strong>${jobTitle}</strong>. Avaliamos seu perfil com atenção, mas a empresa optou por seguir com outro candidato para esta posição.</p>
        <p>Isso não significa o fim da sua busca — temos outras vagas abertas agora, e você pode se candidatar diretamente:</p>
        <p style="margin: 28px 0;">
          <a href="${vagasLink}" style="background: #E85C2A; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Ver vagas abertas
          </a>
        </p>
        <p>Continue de olho, boa sorte na recolocação!</p>
        <p style="color: #6B6864; font-size: 13px; margin-top: 24px;">Equipe Ryze<br />Se o botão não funcionar, copie e cole este link no navegador:<br />${vagasLink}</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
