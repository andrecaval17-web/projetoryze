"use server";

import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { getAiClient, AI_MODELS } from "@/lib/ai/client";
import { logAiUsage } from "@/lib/ai/usage";
import { extractPdfText } from "@/lib/pdf";

export interface NextStep {
  text: string;
  done: boolean;
}

export interface LinkedinState {
  status: "idle" | "success" | "error";
  message?: string;
  analysis?: string;
  score?: number;
  nextSteps?: NextStep[];
  /** Id da linha em `linkedin_analyses` — precisa pra marcar itens do
   * checklist como feitos. */
  analysisId?: string;
  /** Ecoado de volta quando a análise foi gerada dentro do fluxo guiado —
   * usado pra oferecer o próximo passo (Simulação de Entrevista). */
  jobApplicationId?: string;
}

// Abaixo do `bodySizeLimit` de Server Actions em next.config.ts — deixa
// margem pro overhead do multipart/form-data (boundaries, headers de campo).
// Um PDF exportado do LinkedIn com foto de perfil facilmente passa de 1MB,
// por isso o limite não pode ficar no default do Next.js.
const MAX_FILE_SIZE_BYTES = 6 * 1024 * 1024;

interface ParsedAnalysis {
  score: number;
  analysis: string;
  next_steps: string[];
}

function parseAnalysisJson(content: string): ParsedAnalysis {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned);
  }
  const obj = parsed as Partial<ParsedAnalysis>;
  return {
    score: typeof obj.score === "number" ? Math.max(0, Math.min(100, Math.round(obj.score))) : 0,
    analysis: typeof obj.analysis === "string" ? obj.analysis : "",
    next_steps: Array.isArray(obj.next_steps) ? obj.next_steps.filter((s): s is string => typeof s === "string") : [],
  };
}

export async function analyzeLinkedin(
  _prev: LinkedinState,
  formData: FormData
): Promise<LinkedinState> {
  const jobApplicationId = String(formData.get("job_application_id") || "").trim() || undefined;
  const file = formData.get("pdf");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Selecione o PDF exportado do seu perfil do LinkedIn." };
  }
  if (file.type !== "application/pdf") {
    return { status: "error", message: "O arquivo precisa estar no formato PDF." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      status: "error",
      message: "O PDF é grande demais (máximo 6 MB). Tente exportar novamente ou reduzir o arquivo.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sua sessão expirou. Faça login novamente." };
  }

  const plan = await getCurrentUserPlan();
  if (plan !== "impulso" && plan !== "mentoria") {
    return {
      status: "error",
      message: "Essa ferramenta é exclusiva dos planos Impulso e Mentoria.",
    };
  }

  let extractedText: string;

  try {
    const arrayBuffer = await file.arrayBuffer();
    extractedText = await extractPdfText(new Uint8Array(arrayBuffer));
    if (!extractedText) throw new Error("PDF sem texto extraível");
  } catch (err) {
    console.error("PDF text extraction failed", err);
    return {
      status: "error",
      message:
        "Não foi possível ler esse PDF. Confirme que é o PDF exportado do seu perfil do LinkedIn (Perfil → Mais → Salvar como PDF).",
    };
  }

  let parsed: ParsedAnalysis;

  try {
    const openai = getAiClient();
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.linkedinAnalysis,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Você analisa perfis do LinkedIn (texto extraído do PDF exportado pelo próprio usuário) e dá sugestões objetivas e práticas de melhoria, em português do Brasil.

Responda SOMENTE com um objeto JSON válido (sem markdown, sem \`\`\`, sem texto antes ou depois), seguindo EXATAMENTE este formato:
{
  "score": number (0 a 100, nota geral de quão completo e forte está o perfil pra atrair recrutadores),
  "analysis": string (markdown com pontos fortes e o que falta ou pode ser melhorado: clareza do resumo, descrição das experiências, palavras-chave, etc — tom objetivo e prático),
  "next_steps": [string] (2 a 3 próximos passos concretos e acionáveis, cada um uma frase curta e direta — ex: "Reescrever o resumo com foco em resultados mensuráveis")
}`,
        },
        {
          role: "user",
          content: `Texto extraído do PDF do LinkedIn:\n\n${extractedText}\n\nAnalise este perfil e dê sugestões de melhoria.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    if (!content) throw new Error("OpenAI returned an empty completion");
    parsed = parseAnalysisJson(content);

    await logAiUsage(user.id, "linkedin", AI_MODELS.linkedinAnalysis, completion.usage);
  } catch (err) {
    console.error("LinkedIn analysis failed", err);
    return {
      status: "error",
      message: "Não foi possível analisar agora. Tente novamente em instantes.",
    };
  }

  const nextSteps: NextStep[] = parsed.next_steps.map((text) => ({ text, done: false }));
  let analysisId: string | undefined;

  try {
    // `insert`, não `upsert` — cada análise agora é uma linha de histórico
    // (ver 0011_evolution_panel.sql), pro Painel de evolução conseguir
    // mostrar a pontuação ao longo do tempo.
    const { data: saved, error } = await supabase
      .from("linkedin_analyses")
      .insert({ user_id: user.id, analysis: parsed.analysis, score: parsed.score, next_steps: nextSteps })
      .select("id")
      .single();
    if (error) throw error;

    analysisId = saved.id;

    if (jobApplicationId && saved) {
      await linkJobApplicationLinkedin(jobApplicationId, saved.id);
    }
  } catch (err) {
    console.error("Failed to save linkedin analysis", err);
  }

  return {
    status: "success",
    analysis: parsed.analysis,
    score: parsed.score,
    nextSteps,
    analysisId,
    jobApplicationId,
  };
}

async function linkJobApplicationLinkedin(jobApplicationId: string, linkedinAnalysisId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("job_applications")
    .update({ linkedin_analysis_id: linkedinAnalysisId, updated_at: new Date().toISOString() })
    .eq("id", jobApplicationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to link linkedin analysis to job application", error);
  }
}

/**
 * Passo 2 do fluxo guiado quando o candidato já tem uma análise de
 * LinkedIn e escolhe reaproveitá-la em vez de refazer o upload — sempre a
 * MAIS RECENTE agora que `linkedin_analyses` é histórico (nunca
 * `.maybeSingle()`: com mais de uma linha por usuário isso falha, é
 * exatamente o bug que já mordeu este projeto uma vez em
 * `getCurrentUserPlan()`).
 */
export async function reuseLinkedinAnalysis(
  jobApplicationId: string
): Promise<{ status: "success" | "error"; message?: string }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sua sessão expirou. Faça login novamente." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("linkedin_analyses")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error("Failed to fetch latest linkedin analysis", fetchError);
  }

  const latest = existing?.[0];
  if (!latest) {
    return { status: "error", message: "Nenhuma análise encontrada pra reaproveitar." };
  }

  const { error } = await supabase
    .from("job_applications")
    .update({ linkedin_analysis_id: latest.id, updated_at: new Date().toISOString() })
    .eq("id", jobApplicationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to reuse linkedin analysis", error);
    return { status: "error", message: "Não foi possível vincular a análise a esta vaga." };
  }

  return { status: "success" };
}

/** Marca/desmarca um item do checklist de próximos passos de uma análise. */
export async function toggleLinkedinNextStep(
  analysisId: string,
  stepIndex: number
): Promise<{ status: "success" | "error"; message?: string; nextSteps?: NextStep[] }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sua sessão expirou. Faça login novamente." };
  }

  const { data: row, error: fetchError } = await supabase
    .from("linkedin_analyses")
    .select("next_steps")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !row) {
    return { status: "error", message: "Não foi possível encontrar este checklist." };
  }

  const steps = (row.next_steps as NextStep[] | null) ?? [];
  if (stepIndex < 0 || stepIndex >= steps.length) {
    return { status: "error", message: "Item inválido." };
  }

  const updatedSteps = steps.map((s, i) => (i === stepIndex ? { ...s, done: !s.done } : s));

  const { error } = await supabase
    .from("linkedin_analyses")
    .update({ next_steps: updatedSteps })
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to toggle linkedin next step", error);
    return { status: "error", message: "Não foi possível salvar." };
  }

  return { status: "success", nextSteps: updatedSteps };
}
