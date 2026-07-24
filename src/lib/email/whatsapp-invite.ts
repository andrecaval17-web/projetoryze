import { getResendClient } from "./client";

// `RESEND_FROM_EMAIL` fica vazio até o cliente verificar um domínio de
// envio no Resend — sem isso, `onboarding@resend.dev` só entrega pro
// próprio dono da conta Resend (bom pra teste, não serve pra candidatos de
// verdade). Ver HANDOFF.md sobre o que falta configurar em produção.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Ryze <onboarding@resend.dev>";

/**
 * Convite pro grupo de WhatsApp de vagas, disparado uma única vez por
 * candidato (ver `maybeSendWhatsappInvite` em src/lib/whatsapp-invite.ts,
 * que já garante isso antes de chamar aqui) — nunca lança: quem chama
 * decide como reagir a uma falha de envio, e o convite em si não pode
 * travar o fluxo principal (salvar perfil / gerar currículo).
 */
export async function sendWhatsappInviteEmail(to: string, name: string): Promise<void> {
  const resend = getResendClient();
  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK;

  if (!resend) {
    console.warn("[email] RESEND_API_KEY não configurada — convite pro WhatsApp não enviado por e-mail.");
    return;
  }
  if (!whatsappLink) {
    console.warn("[email] NEXT_PUBLIC_WHATSAPP_GROUP_LINK não configurado — convite pro WhatsApp não enviado.");
    return;
  }
  if (!to) return;

  const firstName = name.trim().split(" ")[0];
  const greeting = firstName ? `Parabéns, ${firstName}!` : "Parabéns!";

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Seu currículo está pronto — entre no grupo de vagas da Ryze",
    html: `
      <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2E2C2A; line-height: 1.5;">
        <h1 style="font-size: 20px; margin-bottom: 12px;">${greeting}</h1>
        <p>Seu currículo com IA já está pronto na Ryze. Enquanto você segue evoluindo seu perfil e se preparando pra próxima entrevista, entre no nosso grupo de WhatsApp — vagas novas todos os dias, sem custo e sem compromisso.</p>
        <p style="margin: 28px 0;">
          <a href="${whatsappLink}" style="background: #E85C2A; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Entrar no grupo de vagas
          </a>
        </p>
        <p style="color: #6B6864; font-size: 13px;">Se o botão não funcionar, copie e cole este link no navegador:<br />${whatsappLink}</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
