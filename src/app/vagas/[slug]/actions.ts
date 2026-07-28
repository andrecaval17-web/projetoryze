"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAiClient, AI_MODELS } from "@/lib/ai/client";
import { logAiUsage } from "@/lib/ai/usage";
import { extractPdfText } from "@/lib/pdf";
import { findUserIdByEmail } from "@/lib/admin/find-user-by-email";
import { createApplicationTalentPoolEntry } from "@/lib/talent-pool";

export interface ApplicationState {
  status: "idle" | "success" | "error";
  message?: string;
}

// Mesmo limite do upload de currículo em painel/linkedin — dá margem pro
// overhead do multipart/form-data dentro do bodySizeLimit de next.config.ts.
const MAX_FILE_SIZE_BYTES = 6 * 1024 * 1024;

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

export async function submitApplication(
  _prev: ApplicationState,
  formData: FormData
): Promise<ApplicationState> {
  const jobPostingId = String(formData.get("job_posting_id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const linkedinUrl = String(formData.get("linkedin_url") || "").trim();
  const acceptedTerms = formData.get("terms") === "on";
  const file = formData.get("resume");

  if (!jobPostingId || !name || !email) {
    return { status: "error", message: "Preencha nome e e-mail." };
  }
  // O checkbox já é `required` no HTML, mas o servidor nunca confia só na
  // validação do client (mesmo padrão do cadastro de candidato).
  if (!acceptedTerms) {
    return { status: "error", message: "É necessário aceitar os Termos de Uso para se candidatar." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Selecione o PDF do seu currículo." };
  }
  if (file.type !== "application/pdf") {
    return { status: "error", message: "O arquivo precisa estar no formato PDF." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { status: "error", message: "O PDF é grande demais (máximo 6 MB)." };
  }

  const supabase = getSupabaseAdminClient();

  const { data: job, error: jobError } = await supabase
    .from("ats_job_postings")
    .select("id, title, description, requirements, status")
    .eq("id", jobPostingId)
    .maybeSingle();

  if (jobError || !job) {
    return { status: "error", message: "Vaga não encontrada." };
  }
  if (job.status !== "aberta") {
    return { status: "error", message: "Esta vaga não está mais recebendo candidaturas." };
  }

  const { data: questions, error: questionsError } = await supabase
    .from("ats_job_questions")
    .select("id, question")
    .eq("job_posting_id", jobPostingId);

  if (questionsError) {
    console.error("Failed to fetch ATS job questions", questionsError);
    return { status: "error", message: "Não foi possível carregar o formulário. Tente novamente." };
  }

  const answers = (questions ?? []).map((q) => ({
    questionId: q.id,
    answer: String(formData.get(`question-${q.id}`) || "").trim(),
  }));

  if (answers.some((a) => !a.answer)) {
    return { status: "error", message: "Responda todas as perguntas antes de enviar." };
  }

  let extractedText: string;
  try {
    const arrayBuffer = await file.arrayBuffer();
    extractedText = await extractPdfText(new Uint8Array(arrayBuffer));
    if (!extractedText) throw new Error("PDF sem texto extraível");
  } catch (err) {
    console.error("ATS resume PDF extraction failed", err);
    return {
      status: "error",
      message: "Não foi possível ler esse PDF. Confirme que o arquivo não está corrompido ou protegido.",
    };
  }

  const resumeStoragePath = `${jobPostingId}/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("ats-resumes")
    .upload(resumeStoragePath, file, { contentType: "application/pdf" });

  if (uploadError) {
    console.error("ATS resume upload failed", uploadError);
    return { status: "error", message: "Não foi possível enviar o currículo agora. Tente novamente." };
  }

  let score: ScoreResult = { score: 0, reasoning: "" };
  try {
    const openai = getAiClient();
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.linkedinAnalysis,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Você avalia a aderência de um currículo a uma vaga, em português do Brasil.

Responda SOMENTE com um objeto JSON válido (sem markdown, sem \`\`\`, sem texto antes ou depois), seguindo EXATAMENTE este formato:
{
  "score": number (0 a 100, o quanto o currículo atende aos requisitos e à descrição da vaga),
  "reasoning": string (2 a 3 frases objetivas explicando a nota: pontos de aderência e principais lacunas)
}`,
        },
        {
          role: "user",
          content: `Vaga: ${job.title}\n\nDescrição:\n${job.description}\n\nRequisitos:\n${job.requirements}\n\nCurrículo do candidato:\n${extractedText}\n\nAvalie a aderência deste currículo a esta vaga.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    if (!content) throw new Error("OpenAI returned an empty completion");
    score = parseScoreJson(content);

    await logAiUsage(null, "ats", AI_MODELS.linkedinAnalysis, completion.usage);
  } catch (err) {
    console.error("ATS scoring failed", err);
    // Score é um extra, não bloqueia o recebimento da candidatura — segue
    // com score 0/sem reasoning, o time ainda vê o currículo manualmente.
  }

  const candidateUserId = await findUserIdByEmail(email).catch(() => null);

  const { data: application, error: insertError } = await supabase
    .from("ats_applications")
    .insert({
      job_posting_id: jobPostingId,
      candidate_user_id: candidateUserId,
      name,
      email,
      phone: phone || null,
      resume_storage_path: resumeStoragePath,
      linkedin_url: linkedinUrl || null,
      score: score.score,
      score_reasoning: score.reasoning || null,
    })
    .select("id")
    .single();

  if (insertError || !application) {
    console.error("Failed to save ATS application", insertError);
    return { status: "error", message: "Não foi possível registrar sua candidatura agora. Tente novamente." };
  }

  if (answers.length > 0) {
    const { error: answersError } = await supabase.from("ats_application_answers").insert(
      answers.map((a) => ({
        application_id: application.id,
        question_id: a.questionId,
        answer: a.answer,
      }))
    );
    if (answersError) {
      // A candidatura já foi salva — perder as respostas aqui não deve
      // fazer o candidato reenviar tudo de novo. Loga pro time investigar.
      console.error("Failed to save ATS application answers", answersError);
    }
  }

  // Toda candidatura vira uma cópia no banco de talentos (ver seção 12 dos
  // Termos de Uso, aceitos acima) — best-effort, nunca bloqueia o envio.
  await createApplicationTalentPoolEntry({
    atsApplicationId: application.id,
    candidateUserId,
    name,
    email,
    phone: phone || null,
    linkedinUrl: linkedinUrl || null,
    resumeStoragePath,
    summary: extractedText.slice(0, 2000) || null,
  });

  return { status: "success" };
}
