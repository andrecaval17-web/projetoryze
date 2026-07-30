import type { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { sendRejectionEmail } from "@/lib/email/rejection";

/**
 * E-mail de rejeição, disparado uma única vez por candidatura — a primeira
 * vez que `pipeline_status` vira 'rejeitado'. `rejection_email_sent_at` é o
 * único ponto de verdade (mesmo padrão de `whatsapp_invite_sent_at` em
 * `maybeSendWhatsappInvite`, src/lib/whatsapp-invite.ts): uma marca
 * permanente, não uma comparação com o status anterior — se o admin mover a
 * candidatura pra fora de "rejeitado" e voltar pra "rejeitado" de novo por
 * engano, não reenvia.
 *
 * `.is("rejection_email_sent_at", null)` no `update` é a guarda contra
 * corrida, mesma lógica do convite de WhatsApp.
 */
export async function maybeSendRejectionEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  applicationId: string,
  jobId: string
): Promise<void> {
  const { data: application } = await supabase
    .from("ats_applications")
    .select("name, email, rejection_email_sent_at")
    .eq("id", applicationId)
    .maybeSingle();

  if (!application || application.rejection_email_sent_at) return;

  const { error, count } = await supabase
    .from("ats_applications")
    .update({ rejection_email_sent_at: new Date().toISOString() }, { count: "exact" })
    .eq("id", applicationId)
    .is("rejection_email_sent_at", null);

  if (error) {
    console.error("[ats] falha ao marcar e-mail de rejeição como enviado", error);
    return;
  }
  if (!count) return;

  const { data: job } = await supabase.from("ats_job_postings").select("title").eq("id", jobId).maybeSingle();

  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const vagasLink = `${protocol}://${host}/vagas`;

  try {
    await sendRejectionEmail(application.email, application.name, job?.title ?? "a vaga", vagasLink);
  } catch (err) {
    // Não bloqueia a atualização de status no painel admin por uma falha de
    // e-mail — o status já foi salvo com sucesso.
    console.error("[ats] falha ao enviar e-mail de rejeição", err);
  }
}
