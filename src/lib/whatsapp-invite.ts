import type { SupabaseClient } from "@supabase/supabase-js";
import { sendWhatsappInviteEmail } from "@/lib/email/whatsapp-invite";

/**
 * Convite pro grupo de WhatsApp (banner + e-mail), disparado uma única vez
 * por candidato, na primeira vez que ele tem um currículo de verdade pra
 * ver — qualquer plano. `candidate_profiles.whatsapp_invite_sent_at` é o
 * único ponto de verdade: os dois lugares que podem chamar isto (perfil
 * salvo pela primeira vez no Grátis, ou primeira "Adaptar para vaga" nos
 * planos pagos) checam essa coluna antes de agir — qual dos dois acontecer
 * primeiro pra um usuário consome a flag, o outro vira no-op.
 *
 * `.is("whatsapp_invite_sent_at", null)` no `update` é a guarda contra
 * corrida: se duas chamadas concorrentes tentarem consumir a flag ao mesmo
 * tempo, só uma tem `count > 0` (a linha ainda estava null quando ela
 * rodou) — a outra atualiza zero linhas e sabe que já foi disparado.
 *
 * Retorna `true` só quando ESTA chamada foi quem disparou o convite —
 * usado pra decidir se mostra o banner nesta resposta específica.
 */
export async function maybeSendWhatsappInvite(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  email: string,
  name: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("whatsapp_invite_sent_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile?.whatsapp_invite_sent_at) return false;

  const { error, count } = await supabase
    .from("candidate_profiles")
    .update({ whatsapp_invite_sent_at: new Date().toISOString() }, { count: "exact" })
    .eq("user_id", userId)
    .is("whatsapp_invite_sent_at", null);

  if (error) {
    console.error("[whatsapp-invite] falha ao marcar convite como enviado", error);
    return false;
  }
  if (!count) return false;

  try {
    await sendWhatsappInviteEmail(email, name);
  } catch (err) {
    // Não bloqueia o fluxo principal (salvar perfil / gerar currículo) por
    // uma falha de e-mail — o banner na tela já cobre o convite mesmo se o
    // e-mail falhar.
    console.error("[whatsapp-invite] falha ao enviar e-mail de convite", err);
  }

  return true;
}
