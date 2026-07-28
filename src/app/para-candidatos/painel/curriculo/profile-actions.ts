"use server";

import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { getAiClient, AI_MODELS } from "@/lib/ai/client";
import { logAiUsage } from "@/lib/ai/usage";
import { extractPdfText, extractDocxText } from "@/lib/pdf";
import { parseResumeJson, normalizeResumeData, type ResumeData } from "@/lib/resume-schema";
import { maybeSendWhatsappInvite } from "@/lib/whatsapp-invite";
import { updateCadastroTalentPoolEntry } from "@/lib/talent-pool";

const MAX_FILE_SIZE_BYTES = 6 * 1024 * 1024;

const EXTRACTION_SYSTEM_PROMPT = `Você organiza o texto de um currículo já existente (colado ou extraído de um PDF/Word) em dados estruturados, em português do Brasil.

Responda SOMENTE com um objeto JSON válido (sem markdown, sem \`\`\`, sem texto antes ou depois), seguindo EXATAMENTE este formato:
{
  "nome": string,
  "titulo": string (cargo/título profissional principal do candidato),
  "resumo": string (2-4 frases, resumo profissional),
  "contato": { "email": string, "telefone": string, "linkedin": string },
  "experiencias": [ { "cargo": string, "empresa": string, "periodo": { "inicioMes": string, "inicioAno": string, "fimMes": string, "fimAno": string, "atual": boolean }, "descricao": string } ],
  "formacao": [ { "curso": string, "instituicao": string, "periodo": { "inicioMes": string, "inicioAno": string, "fimMes": string, "fimAno": string, "atual": boolean } } ],
  "habilidades": [string],
  "idiomas": [string]
}

Regras:
- Extraia APENAS o que está no texto — nunca invente experiências, formações, habilidades, e-mail ou telefone que não apareçam.
- Se um campo não estiver presente no texto, devolva string vazia "" (ou array vazio), nunca invente.
- Preserve os fatos (datas, nomes de empresas/instituições) exatamente como estão no texto original.
- "periodo": "inicioMes"/"fimMes" são dois dígitos ("01" a "12"); "inicioAno"/"fimAno" são o ano com 4 dígitos ("2021"). Se o texto só tiver o ano (sem mês), deixe o mês como string vazia "". Se o cargo/curso estiver em andamento (ex: "atual", "presente", "em andamento"), marque "atual": true e deixe "fimMes"/"fimAno" vazios. Nunca invente mês/ano que não esteja no texto.
- "habilidades" é uma lista só de habilidades técnicas/comportamentais (ex: "Excel avançado", "Gestão de projetos") — NÃO inclua idiomas aqui.
- "idiomas" é uma lista separada, só de idiomas (ex: "Inglês avançado", "Espanhol intermediário") — se o texto tiver uma seção de "Idiomas", cada item vai nesse array, nunca em "habilidades".`;

export interface ExtractProfileState {
  status: "idle" | "success" | "error";
  message?: string;
  data?: ResumeData;
}

async function runExtraction(sourceText: string): Promise<ResumeData> {
  const openai = getAiClient();
  const completion = await openai.chat.completions.create({
    model: AI_MODELS.resumeExtraction,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: `Texto do currículo:\n\n${sourceText}` },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  if (!content) throw new Error("A IA não retornou conteúdo.");

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await logAiUsage(user.id, "resume", AI_MODELS.resumeExtraction, completion.usage);
  }

  return parseResumeJson(content);
}

export async function extractProfileFromText(
  _prev: ExtractProfileState,
  formData: FormData
): Promise<ExtractProfileState> {
  const text = String(formData.get("pasted_text") || "").trim();
  if (!text) {
    return { status: "error", message: "Cole o texto do seu currículo." };
  }

  try {
    const data = await runExtraction(text);
    return { status: "success", data };
  } catch (err) {
    console.error("Profile extraction from text failed", err);
    return { status: "error", message: "Não foi possível interpretar o texto agora. Tente novamente." };
  }
}

export async function extractProfileFromFile(
  _prev: ExtractProfileState,
  formData: FormData
): Promise<ExtractProfileState> {
  const file = formData.get("resume_file");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Selecione um arquivo PDF ou Word." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { status: "error", message: "O arquivo é grande demais (máximo 6 MB)." };
  }

  const isPdf = file.type === "application/pdf";
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx");

  if (!isPdf && !isDocx) {
    return { status: "error", message: "Envie um arquivo PDF ou Word (.docx)." };
  }

  let extractedText: string;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    extractedText = isPdf ? await extractPdfText(bytes) : await extractDocxText(bytes);
    if (!extractedText) throw new Error("Arquivo sem texto extraível");
  } catch (err) {
    console.error("Resume file text extraction failed", err);
    return {
      status: "error",
      message: "Não foi possível ler esse arquivo. Confirme que ele contém texto (não uma imagem escaneada).",
    };
  }

  try {
    const data = await runExtraction(extractedText);
    return { status: "success", data };
  } catch (err) {
    console.error("Profile extraction from file failed", err);
    return { status: "error", message: "Não foi possível interpretar o arquivo agora. Tente novamente." };
  }
}

export interface SaveProfileState {
  status: "idle" | "success" | "error" | "session_mismatch";
  message?: string;
  /** Só true na resposta que efetivamente disparou o convite pro grupo de
   * WhatsApp pela primeira vez — ver src/lib/whatsapp-invite.ts. */
  whatsappInviteJustSent?: boolean;
}

/**
 * `expectedUserId` é o id do usuário que estava autenticado quando o
 * formulário carregou (capturado no server component da página, não em
 * cookie/estado que o client possa ter perdido de vista). Existe pra
 * fechar uma classe real de vazamento entre contas: se uma aba fica aberta
 * com o formulário carregado e, sem recarregar, a sessão do navegador
 * muda pra outra conta (cookie é compartilhado entre abas da mesma
 * origem), um salvamento disparado dessa aba obsoleta — inclusive o
 * rascunho automático — escreveria os dados antigos na conta ATUAL da
 * sessão, não na conta a quem os dados pertencem. Reproduzido e confirmado
 * em 2026-07-18 (ver HANDOFF.md) — sem essa checagem, `saveBaseProfile`
 * confia cegamente em qualquer sessão ativa no momento da chamada.
 */
/**
 * `isManualSave` distingue o clique deliberado em "Salvar perfil" (ou
 * "Salvar alterações") do rascunho automático (debounce de digitação +
 * segurança de troca de aba, ver base-profile-form.tsx) — os dois chamam
 * esta mesma função, mas só o clique manual pode disparar o convite pro
 * WhatsApp. Sem essa distinção, o rascunho automático dispararia o convite
 * (e o e-mail) sozinho, poucos segundos depois da tela abrir, sobre um
 * perfil ainda vazio — o candidato nunca teria chance de preenchê-lo antes
 * de "gastar" o convite único.
 */
export async function saveBaseProfile(
  data: ResumeData,
  expectedUserId: string,
  isManualSave = false
): Promise<SaveProfileState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sua sessão expirou. Faça login novamente." };
  }

  if (user.id !== expectedUserId) {
    return {
      status: "session_mismatch",
      message: "Sua sessão mudou nesta aba (outra conta foi acessada em outra aba). Recarregue a página antes de salvar, pra não gravar dados na conta errada.",
    };
  }

  const normalized = normalizeResumeData(data);

  // Este é agora o ÚNICO formulário de entrada do candidato (substitui o
  // antigo /para-candidatos/comecar) — por isso é upsert, não update: a
  // linha em `candidate_profiles` pode não existir ainda. As colunas antigas
  // (full_name/email/experience_summary/target_role) continuam sendo
  // preenchidas em paralelo porque outras telas ainda leem diretamente
  // delas (saudação do painel, admin, pré-preenchimento do Cal.com,
  // contexto da simulação de entrevista) — mantê-las em sincronia evita
  // precisar tocar em todos esses pontos agora.
  const { error } = await supabase.from("candidate_profiles").upsert(
    {
      user_id: user.id,
      profile_data: normalized,
      full_name: normalized.nome || (user.user_metadata?.full_name as string) || "",
      email: user.email ?? "",
      phone: normalized.contato.telefone || null,
      experience_summary: normalized.resumo || "",
      target_role: normalized.titulo || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to save base profile", error);
    return { status: "error", message: "Não foi possível salvar agora. Tente novamente." };
  }

  // Mantém a entrada do banco de talentos (criada no cadastro) sincronizada
  // com cargo desejado/habilidades/resumo — esses campos só existem a
  // partir do primeiro salvamento do perfil, não no momento do cadastro.
  await updateCadastroTalentPoolEntry(user.id, {
    name: normalized.nome || (user.user_metadata?.full_name as string) || "",
    email: user.email ?? "",
    phone: normalized.contato.telefone || null,
    targetRole: normalized.titulo || null,
    skills: normalized.habilidades,
    summary: normalized.resumo || null,
  });

  // Só dispara pro plano Grátis, e só em salvamento manual (ver comentário
  // no parâmetro `isManualSave`) — é o único caso em que salvar o perfil É
  // o momento de "primeiro currículo pronto pra ver" (tela "gratis" do
  // workspace). Nos planos pagos esse momento é a primeira "Adaptar para
  // vaga" bem-sucedida (ver generateAdaptedResume em curriculo/actions.ts),
  // que dispara o mesmo convite separadamente.
  let whatsappInviteJustSent = false;
  if (isManualSave && user.email) {
    const plan = await getCurrentUserPlan();
    if (plan !== "impulso" && plan !== "mentoria") {
      whatsappInviteJustSent = await maybeSendWhatsappInvite(supabase, user.id, user.email, normalized.nome);
    }
  }

  return { status: "success", whatsappInviteJustSent };
}

/**
 * Reescreve um texto do currículo (resumo ou descrição de experiência) com
 * tom mais profissional — nunca inventa fatos que o candidato não informou,
 * só reorganiza/melhora a redação do que já foi escrito.
 */
export async function improveResumeText(
  kind: "resumo" | "experiencia",
  text: string,
  context?: { titulo?: string; cargo?: string; empresa?: string }
): Promise<{ status: "success"; text: string } | { status: "error"; message: string }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { status: "error", message: "Escreva algo antes de melhorar com IA." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Sua sessão expirou. Faça login novamente." };
  }

  // "Melhorar com IA" é recurso dos planos pagos — checado aqui, não só
  // escondendo o botão na tela, seguindo o mesmo padrão do resto do app.
  const plan = await getCurrentUserPlan();
  if (plan !== "impulso" && plan !== "mentoria") {
    return { status: "error", message: "Melhorar com IA é um recurso dos planos Impulso e Mentoria." };
  }

  const contextLine =
    kind === "resumo"
      ? context?.titulo
        ? `Título profissional do candidato: ${context.titulo}.`
        : ""
      : `Cargo: ${context?.cargo || "não informado"}. Empresa: ${context?.empresa || "não informada"}.`;

  try {
    const openai = getAiClient();
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.resumeImprove,
      messages: [
        {
          role: "system",
          content: `Você melhora a redação de um trecho de currículo em português do Brasil, deixando mais profissional, claro e objetivo. NUNCA invente fatos, números, empresas ou responsabilidades que não estejam no texto original — só reescreve o que já foi dito. Responda APENAS com o texto melhorado, sem aspas, sem comentários, sem explicações.`,
        },
        {
          role: "user",
          content: `${contextLine}\n\nTexto original:\n${trimmed}\n\nReescreva de forma mais profissional, mantendo os mesmos fatos.`,
        },
      ],
    });

    const improved = completion.choices[0]?.message?.content?.trim();
    if (!improved) throw new Error("A IA não retornou conteúdo.");

    await logAiUsage(user.id, "resume", AI_MODELS.resumeImprove, completion.usage);

    return { status: "success", text: improved };
  } catch (err) {
    console.error("Improve resume text failed", err);
    return { status: "error", message: "Não foi possível melhorar o texto agora. Tente novamente." };
  }
}
