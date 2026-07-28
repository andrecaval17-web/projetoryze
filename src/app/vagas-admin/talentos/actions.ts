"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAiClient, AI_MODELS } from "@/lib/ai/client";
import { logAiUsage } from "@/lib/ai/usage";
import {
  generateResumePdfBuffer,
  buildResumeDataFromTalentPool,
} from "@/lib/generate-resume-pdf-server";

interface ScoreResult {
  score: number;
  reasoning: string;
}

function parseScoreJson(content: string): ScoreResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned);
  }
  const obj = parsed as Partial<ScoreResult>;
  return {
    score: typeof obj.score === "number" ? Math.max(0, Math.min(100, Math.round(obj.score))) : 0,
    reasoning: typeof obj.reasoning === "string" ? obj.reasoning : "",
  };
}

interface JobForScoring {
  title: string;
  description: string;
  requirements: string;
}

/** Mesmo prompt de avaliação usado na candidatura pública (vagas/[slug]/actions.ts). */
async function scoreCandidateAgainstJob(job: JobForScoring, candidateText: string): Promise<ScoreResult> {
  try {
    const openai = getAiClient();
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.linkedinAnalysis,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Você avalia a aderência de um perfil de candidato a uma vaga, em português do Brasil.

Responda SOMENTE com um objeto JSON válido (sem markdown, sem \`\`\`, sem texto antes ou depois), seguindo EXATAMENTE este formato:
{
  "score": number (0 a 100, o quanto o perfil atende aos requisitos e à descrição da vaga),
  "reasoning": string (2 a 3 frases objetivas explicando a nota: pontos de aderência e principais lacunas)
}`,
        },
        {
          role: "user",
          content: `Vaga: ${job.title}\n\nDescrição:\n${job.description}\n\nRequisitos:\n${job.requirements}\n\nPerfil do candidato:\n${candidateText}\n\nAvalie a aderência deste perfil a esta vaga.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    if (!content) throw new Error("OpenAI returned an empty completion");
    const result = parseScoreJson(content);
    await logAiUsage(null, "ats", AI_MODELS.linkedinAnalysis, completion.usage);
    return result;
  } catch (err) {
    console.error("Talent pool AI scoring failed", err);
    return { score: 0, reasoning: "" };
  }
}

function talentCandidateText(talent: {
  name: string;
  target_role: string | null;
  skills: string[];
  summary: string | null;
}): string {
  const parts = [
    talent.target_role ? `Cargo desejado: ${talent.target_role}` : "",
    talent.skills.length > 0 ? `Habilidades: ${talent.skills.join(", ")}` : "",
    talent.summary ? `Resumo: ${talent.summary}` : "",
  ].filter(Boolean);
  return parts.join("\n") || `Candidato: ${talent.name} (sem dados de perfil detalhados)`;
}

export interface TalentScoreResult {
  id: string;
  score: number;
  reasoning: string;
}

/**
 * Roda a IA contra os candidatos do banco de talentos filtrados na tela,
 * pra ajudar a priorizar quem faz mais sentido pra uma vaga específica.
 * Não grava nada — o score só existe na tela até o admin decidir enviar
 * alguém pro processo (`sendTalentsToPipeline`), que roda a mesma
 * avaliação de novo e aí sim persiste.
 */
export async function scoreTalentsForJob(
  jobPostingId: string,
  talentIds: string[]
): Promise<{ status: "success" | "error"; message?: string; results?: TalentScoreResult[] }> {
  await requireAdmin();

  if (talentIds.length === 0) {
    return { status: "error", message: "Selecione ao menos um candidato pra avaliar." };
  }

  const supabase = getSupabaseAdminClient();
  const { data: job, error: jobError } = await supabase
    .from("ats_job_postings")
    .select("title, description, requirements")
    .eq("id", jobPostingId)
    .maybeSingle();

  if (jobError || !job) {
    return { status: "error", message: "Vaga não encontrada." };
  }

  const { data: talents, error: talentsError } = await supabase
    .from("talent_pool")
    .select("id, name, target_role, skills, summary")
    .in("id", talentIds);

  if (talentsError || !talents) {
    return { status: "error", message: "Não foi possível carregar os candidatos selecionados." };
  }

  const results = await Promise.all(
    talents.map(async (talent) => {
      const score = await scoreCandidateAgainstJob(job, talentCandidateText(talent));
      return { id: talent.id, ...score };
    })
  );

  return { status: "success", results };
}

export interface SendToPipelineState {
  status: "success" | "error";
  message?: string;
}

/**
 * Cria uma candidatura (`ats_applications`) pra cada talento selecionado,
 * já na etapa inicial do pipeline. O talento continua no banco — isso só
 * cria uma cópia dentro do processo dessa vaga (mesma relação de "fonte" já
 * usada pra quem se candidata direto: `talent_pool` e `ats_applications`
 * são registros irmãos, não um substitui o outro).
 */
export async function sendTalentsToPipeline(
  jobPostingId: string,
  talentIds: string[]
): Promise<SendToPipelineState> {
  await requireAdmin();

  if (talentIds.length === 0) {
    return { status: "error", message: "Selecione ao menos um candidato." };
  }

  const supabase = getSupabaseAdminClient();

  const { data: job, error: jobError } = await supabase
    .from("ats_job_postings")
    .select("id, title, description, requirements")
    .eq("id", jobPostingId)
    .maybeSingle();

  if (jobError || !job) {
    return { status: "error", message: "Vaga não encontrada." };
  }

  const { data: talents, error: talentsError } = await supabase
    .from("talent_pool")
    .select("id, candidate_user_id, name, email, phone, linkedin_url, target_role, skills, summary, resume_storage_path")
    .in("id", talentIds);

  if (talentsError || !talents || talents.length === 0) {
    return { status: "error", message: "Não foi possível carregar os candidatos selecionados." };
  }

  const { data: existing } = await supabase
    .from("ats_applications")
    .select("email")
    .eq("job_posting_id", jobPostingId)
    .in(
      "email",
      talents.map((t) => t.email)
    );
  const alreadyApplied = new Set((existing ?? []).map((a) => a.email));

  let sentCount = 0;
  let skippedCount = 0;

  for (const talent of talents) {
    if (alreadyApplied.has(talent.email)) {
      skippedCount += 1;
      continue;
    }

    let resumeStoragePath = talent.resume_storage_path;
    if (!resumeStoragePath) {
      try {
        const resumeData = buildResumeDataFromTalentPool(talent);
        const pdfBuffer = await generateResumePdfBuffer(resumeData);
        resumeStoragePath = `${jobPostingId}/${crypto.randomUUID()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("ats-resumes")
          .upload(resumeStoragePath, pdfBuffer, { contentType: "application/pdf" });
        if (uploadError) throw uploadError;
      } catch (err) {
        console.error("Failed to generate/upload resume PDF for talent pool candidate", talent.id, err);
        skippedCount += 1;
        continue;
      }
    }

    const score = await scoreCandidateAgainstJob(job, talentCandidateText(talent));

    const { error: insertError } = await supabase.from("ats_applications").insert({
      job_posting_id: jobPostingId,
      candidate_user_id: talent.candidate_user_id,
      name: talent.name,
      email: talent.email,
      phone: talent.phone,
      linkedin_url: talent.linkedin_url,
      resume_storage_path: resumeStoragePath,
      score: score.score,
      score_reasoning: score.reasoning || null,
      pipeline_status: "triagem",
    });

    if (insertError) {
      console.error("Failed to send talent pool candidate to pipeline", talent.id, insertError);
      skippedCount += 1;
      continue;
    }
    sentCount += 1;
  }

  revalidatePath(`/vagas-admin/${jobPostingId}`);
  revalidatePath(`/vagas-admin/${jobPostingId}/pipeline`);
  revalidatePath("/vagas-admin/talentos");

  if (sentCount === 0) {
    return {
      status: "error",
      message:
        skippedCount > 0
          ? "Todos os selecionados já estão no processo dessa vaga."
          : "Não foi possível enviar os candidatos selecionados.",
    };
  }

  return {
    status: "success",
    message:
      skippedCount > 0
        ? `${sentCount} candidato${sentCount > 1 ? "s" : ""} enviado${sentCount > 1 ? "s" : ""} pro processo (${skippedCount} já estava${skippedCount > 1 ? "m" : ""} nele).`
        : `${sentCount} candidato${sentCount > 1 ? "s" : ""} enviado${sentCount > 1 ? "s" : ""} pro processo.`,
  };
}
