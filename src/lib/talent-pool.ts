import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Banco de Talentos — proposta aprovada pelo cliente em 2026-07-24.
 * Escrita sempre via service_role (`talent_pool` não tem policy nenhuma
 * pra `authenticated`, mesmo padrão de `ats_applications`). Todas as
 * funções aqui são best-effort: uma falha ao gravar no banco de talentos
 * nunca deve derrubar o cadastro, o salvamento de perfil ou o envio de uma
 * candidatura — só loga no servidor pro time investigar depois.
 */

/**
 * Cria a linha do banco de talentos no momento do cadastro (qualquer
 * plano) — antes mesmo do candidato preencher o perfil. `target_role`/
 * `skills`/`summary` ficam vazios até `updateCadastroTalentPoolEntry` ser
 * chamado quando o perfil for salvo pela primeira vez.
 */
export async function createCadastroTalentPoolEntry(
  userId: string,
  name: string,
  email: string
): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("talent_pool").insert({
      source: "cadastro",
      candidate_user_id: userId,
      name: name || email,
      email,
    });
    if (error) throw error;
  } catch (err) {
    console.error("Failed to create talent_pool entry on signup", err);
  }
}

/**
 * Atualiza a linha de origem `cadastro` sempre que o candidato salva o
 * perfil base — é daqui que vêm cargo desejado/habilidades/resumo, que não
 * existem ainda no momento do cadastro.
 */
export async function updateCadastroTalentPoolEntry(
  userId: string,
  fields: { name: string; email: string; phone: string | null; targetRole: string | null; skills: string[]; summary: string | null }
): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("talent_pool")
      .update({
        name: fields.name || fields.email,
        email: fields.email,
        phone: fields.phone,
        target_role: fields.targetRole,
        skills: fields.skills,
        summary: fields.summary,
        updated_at: new Date().toISOString(),
      })
      .eq("candidate_user_id", userId)
      .eq("source", "cadastro");
    if (error) throw error;
  } catch (err) {
    console.error("Failed to update talent_pool entry on profile save", err);
  }
}

/**
 * Cria a cópia no banco de talentos a partir de uma candidatura pública a
 * vaga — sempre uma linha nova (não faz upsert com uma entrada de
 * `cadastro` já existente), porque representa um evento distinto: "essa
 * pessoa se candidatou a essa vaga", não o perfil geral dela.
 */
export async function createApplicationTalentPoolEntry(params: {
  atsApplicationId: string;
  candidateUserId: string | null;
  name: string;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  resumeStoragePath: string;
  summary: string | null;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("talent_pool").insert({
      source: "candidatura_vaga",
      candidate_user_id: params.candidateUserId,
      ats_application_id: params.atsApplicationId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      linkedin_url: params.linkedinUrl,
      resume_storage_path: params.resumeStoragePath,
      summary: params.summary,
    });
    if (error) throw error;
  } catch (err) {
    console.error("Failed to create talent_pool entry from job application", err);
  }
}
