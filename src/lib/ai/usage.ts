import type { CompletionUsage } from "openai/resources/completions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AiFeature = "resume" | "linkedin" | "interview" | "ats";

/**
 * Grava o consumo de cada chamada à OpenAI para acompanhamento posterior
 * (não há limite de uso aplicado por enquanto — isso é só telemetria).
 * Escreve via service_role porque `ai_usage_log` não tem policy de escrita
 * para usuários comuns: é um log interno, não um dado que o candidato deve
 * poder ler ou alterar sobre si mesmo.
 *
 * `userId` aceita `null` pro score de aderência do ATS (feature 'ats') —
 * calculado no envio público da candidatura, sem usuário autenticado pra
 * atribuir a chamada (ver 0015_ats.sql).
 */
export async function logAiUsage(
  userId: string | null,
  feature: AiFeature,
  model: string,
  usage: CompletionUsage | undefined
) {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("ai_usage_log").insert({
      user_id: userId,
      feature,
      model,
      prompt_tokens: usage?.prompt_tokens ?? null,
      completion_tokens: usage?.completion_tokens ?? null,
      total_tokens: usage?.total_tokens ?? null,
      // Spread em objeto literal para gravar como jsonb sem atrito de tipos
      // com o cliente do Supabase (que espera JSON simples, não a
      // interface tipada da OpenAI).
      metadata: usage ? { ...usage } : null,
    });
    if (error) throw error;
  } catch (err) {
    // Falha ao logar uso nunca deve derrubar a funcionalidade de IA em si
    // para o candidato — só registra no log do servidor.
    console.error("Failed to log AI usage", { feature, model }, err);
  }
}
