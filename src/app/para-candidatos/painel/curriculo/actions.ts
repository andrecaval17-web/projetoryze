"use server";

import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { getAiClient, AI_MODELS } from "@/lib/ai/client";
import { logAiUsage } from "@/lib/ai/usage";
import {
  parseResumeJson,
  normalizeResumeData,
  resolveAllowedTemplate,
  type ResumeData,
  type ResumeTemplateSlug,
} from "@/lib/resume-schema";
import { maybeSendWhatsappInvite } from "@/lib/whatsapp-invite";

export interface ResumeState {
  status: "idle" | "success" | "error";
  message?: string;
  resumeId?: string;
  data?: ResumeData;
  templateSlug?: ResumeTemplateSlug;
  /** Só em geração nova (não em edição de uma versão existente) — usado
   * pra oferecer o próximo passo do fluxo guiado (Análise de LinkedIn). */
  jobApplicationId?: string;
  /** Só true na resposta que efetivamente disparou o convite pro grupo de
   * WhatsApp pela primeira vez — ver src/lib/whatsapp-invite.ts. */
  whatsappInviteJustSent?: boolean;
}

const RESUME_ADAPT_SYSTEM_PROMPT = `Você é um especialista em recrutamento que adapta o currículo de um candidato (já estruturado) para uma vaga específica, em português do Brasil.

Responda SOMENTE com um objeto JSON válido (sem markdown, sem \`\`\`, sem texto antes ou depois), seguindo EXATAMENTE este formato:
{
  "nome": string,
  "titulo": string (o cargo/título profissional do candidato, ex: "Analista de Recrutamento e Seleção Sênior"),
  "resumo": string (2-4 frases),
  "contato": { "email": string, "telefone": string, "linkedin": string },
  "experiencias": [ { "cargo": string, "empresa": string, "periodo": { "inicioMes": string, "inicioAno": string, "fimMes": string, "fimAno": string, "atual": boolean }, "descricao": string } ],
  "formacao": [ { "curso": string, "instituicao": string, "periodo": { "inicioMes": string, "inicioAno": string, "fimMes": string, "fimAno": string, "atual": boolean } } ],
  "habilidades": [string],
  "idiomas": [string]
}

Regras:
- Parta do perfil base do candidato — nunca invente experiências, formações, habilidades ou idiomas que não estejam lá.
- "periodo" de cada experiência/formação vem EXATAMENTE do perfil base (mesmos objetos inicioMes/inicioAno/fimMes/fimAno/atual) — nunca invente ou altere datas.
- Reordene, destaque e reescreva (principalmente o "resumo" e a "descricao" de cada experiência) com foco na vaga informada — a vaga decide o que vale mais destaque, mas os fatos vêm sempre do perfil base.
- Pode omitir do "habilidades"/"idiomas" o que for irrelevante para a vaga, mas nunca adicionar algo que o candidato não listou.`;

export async function generateAdaptedResume(
  _prev: ResumeState,
  formData: FormData
): Promise<ResumeState> {
  const jobTitle = String(formData.get("job_title") || "").trim();
  const jobDescription = String(formData.get("job_description") || "").trim();
  const requestedTemplate = String(formData.get("template_slug") || "").trim();
  const expectedUserId = String(formData.get("expected_user_id") || "").trim();

  if (!jobTitle) {
    return { status: "error", message: "Informe o título da vaga." };
  }
  if (!jobDescription) {
    return { status: "error", message: "Cole a descrição da vaga." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sua sessão expirou. Faça login novamente." };
  }

  // Mesma proteção contra sessão obsoleta de `saveBaseProfile` (ver
  // profile-actions.ts) — se esta aba ficou aberta com o formulário
  // preenchido e, sem recarregar, outra conta passou a estar ativa neste
  // navegador, recusa gerar o currículo pra essa conta com os dados desta
  // aba em vez de criar silenciosamente sob a identidade errada.
  if (expectedUserId && user.id !== expectedUserId) {
    return {
      status: "error",
      message: "Sua sessão mudou nesta aba. Recarregue a página antes de continuar.",
    };
  }

  // Adaptar para vaga é recurso dos planos pagos — nunca confia no
  // `template_slug` que veio do client: resolve de novo aqui contra o plano
  // real.
  const plan = await getCurrentUserPlan();
  const isPaid = plan === "impulso" || plan === "mentoria";
  if (!isPaid) {
    return { status: "error", message: "Adaptar para uma vaga é um recurso dos planos Impulso e Mentoria." };
  }
  const templateSlug = resolveAllowedTemplate(requestedTemplate, isPaid);

  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("profile_data")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.profile_data) {
    return {
      status: "error",
      message: "Preencha seu perfil base antes de adaptar um currículo para uma vaga.",
    };
  }

  const baseProfile = normalizeResumeData(profile.profile_data);

  let resumeData: ResumeData;

  try {
    const openai = getAiClient();
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.resumeGeneration,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: RESUME_ADAPT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Perfil base do candidato (JSON):
${JSON.stringify(baseProfile)}

Vaga-alvo: ${jobTitle}

Descrição da vaga:
${jobDescription}

Monte o currículo adaptado em JSON no formato pedido.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    if (!content) throw new Error("A IA não retornou conteúdo.");
    resumeData = parseResumeJson(content);

    await logAiUsage(user.id, "resume", AI_MODELS.resumeGeneration, completion.usage);
  } catch (err) {
    console.error("Resume generation failed", err);
    return {
      status: "error",
      message: "Não foi possível gerar o currículo agora. Tente novamente em instantes.",
    };
  }

  const { data: inserted, error } = await supabase
    .from("resume_versions")
    .insert({
      user_id: user.id,
      job_title: jobTitle,
      job_description: jobDescription,
      template_slug: templateSlug,
      resume_data: resumeData,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Failed to save resume version", error);
    return {
      status: "error",
      message: "O currículo foi gerado, mas não foi possível salvá-lo. Tente novamente.",
    };
  }

  // Abre o "envelope" do fluxo guiado pra esta vaga — não bloqueia o
  // sucesso da geração do currículo se isso falhar (a Análise de LinkedIn e
  // a Entrevista continuam funcionando soltas, sem o fluxo guiado, se o
  // candidato acessá-las direto).
  let jobApplicationId: string | undefined;
  const { data: jobApp, error: jobAppError } = await supabase
    .from("job_applications")
    .insert({
      user_id: user.id,
      job_title: jobTitle,
      job_description: jobDescription,
      resume_version_id: inserted.id,
    })
    .select("id")
    .single();

  if (jobAppError) {
    console.error("Failed to create job application envelope", jobAppError);
  } else {
    jobApplicationId = jobApp.id;
  }

  // Complementa o gatilho em `saveBaseProfile` (profile-actions.ts): lá só
  // dispara pro plano Grátis, porque salvar o perfil não é "ver um
  // currículo pronto" nos planos pagos — aqui sim é, então é aqui que o
  // convite acontece pra quem só usa os planos pagos.
  let whatsappInviteJustSent = false;
  if (user.email) {
    whatsappInviteJustSent = await maybeSendWhatsappInvite(supabase, user.id, user.email, resumeData.nome);
  }

  return {
    status: "success",
    resumeId: inserted.id,
    data: resumeData,
    templateSlug,
    jobApplicationId,
    whatsappInviteJustSent,
  };
}

export interface DeleteResumeState {
  status: "success" | "error";
  message?: string;
}

/**
 * Exclui uma versão adaptada do currículo (histórico por vaga) — NUNCA o
 * perfil base (`candidate_profiles`), que é uma tabela separada e não tem
 * policy de delete de propósito. O PDF em si não é armazenado em nenhum
 * storage: é gerado inteiramente no browser, a partir de `resume_data`, no
 * momento do clique em "Baixar em PDF" (ver resume-editor.tsx) — então
 * apagar a linha já é suficiente, não existe arquivo residual pra limpar.
 */
export async function deleteResumeVersion(resumeId: string): Promise<DeleteResumeState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sua sessão expirou. Faça login novamente." };
  }

  const { error, count } = await supabase
    .from("resume_versions")
    .delete({ count: "exact" })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete resume version", error);
    return { status: "error", message: "Não foi possível excluir esta versão." };
  }

  if (!count) {
    return { status: "error", message: "Versão não encontrada." };
  }

  return { status: "success" };
}

export interface UpdateResumeState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function updateResumeVersion(
  resumeId: string,
  data: ResumeData,
  requestedTemplate?: string
): Promise<UpdateResumeState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sua sessão expirou. Faça login novamente." };
  }

  const plan = await getCurrentUserPlan();
  const isPaid = plan === "impulso" || plan === "mentoria";
  const templateSlug = resolveAllowedTemplate(requestedTemplate, isPaid);

  const { error } = await supabase
    .from("resume_versions")
    .update({ resume_data: data, template_slug: templateSlug, updated_at: new Date().toISOString() })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to update resume version", error);
    return { status: "error", message: "Não foi possível salvar as alterações." };
  }

  return { status: "success" };
}
