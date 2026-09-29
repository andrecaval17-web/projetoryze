"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { maybeSendRejectionEmail } from "@/lib/ats/rejection-email";

const JOB_STATUSES = ["aberta", "pausada", "encerrada"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

const APPLICATION_STATUSES = [
  "triagem",
  "contato",
  "entrevista_ryze",
  "entrevista_rh",
  "contratado",
  "rejeitado",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface CreateJobPostingState {
  status: "idle" | "error";
  message?: string;
}

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (NFD separa a base da marca combinante)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

export async function createJobPosting(
  _prev: CreateJobPostingState,
  formData: FormData
): Promise<CreateJobPostingState> {
  const session = await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const requirements = String(formData.get("requirements") || "").trim();
  // Presente quando a vaga vem de uma solicitação de abertura revisada
  // (ver src/app/vagas-admin/aberturas) — a vaga nasce pausada em vez de
  // aberta (pedido do cliente em 2026-07-29: texto montado a partir de
  // campos estruturados precisa de uma revisão humana antes de publicar).
  const sourceRequestId = String(formData.get("source_request_id") || "").trim() || null;
  // Perguntas customizadas. Também editáveis depois da vaga publicada, via
  // `updateJobPosting` (ver /vagas-admin/[id]/editar).
  const questions = formData
    .getAll("questions")
    .map((q) => String(q).trim())
    .filter(Boolean);

  if (!title || !description || !requirements) {
    return { status: "error", message: "Preencha título, descrição e requisitos." };
  }

  const supabase = getSupabaseAdminClient();
  const base = slugify(title) || "vaga";

  // Retry em caso de colisão de slug (raro, mas possível com títulos
  // idênticos) — a unique constraint em `slug` é quem garante a
  // integridade de verdade, isso só evita um erro genérico pro admin.
  let jobId: string | undefined;
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`;
    const { data, error } = await supabase
      .from("ats_job_postings")
      .insert({
        title,
        description,
        requirements,
        slug,
        status: sourceRequestId ? "pausada" : "aberta",
        created_by: session.userId,
      })
      .select("id")
      .single();

    if (!error) {
      jobId = data.id;
      break;
    }
    if (error.code !== "23505") {
      console.error("[admin] falha ao criar vaga", error);
      return { status: "error", message: "Não foi possível criar a vaga." };
    }
  }

  if (!jobId) {
    return { status: "error", message: "Não foi possível gerar um link único para a vaga. Tente novamente." };
  }

  if (sourceRequestId) {
    const { error: convertError } = await supabase
      .from("ats_job_requests")
      .update({ status: "convertida", converted_job_posting_id: jobId, updated_at: new Date().toISOString() })
      .eq("id", sourceRequestId);
    if (convertError) {
      // A vaga já foi criada — não desfaz por causa disso, só loga pro
      // time investigar (a solicitação ficaria com status desatualizado).
      console.error("[admin] falha ao marcar solicitação como convertida", convertError);
    }
    revalidatePath("/vagas-admin/aberturas");
    revalidatePath(`/vagas-admin/aberturas/${sourceRequestId}`);
  }

  if (questions.length > 0) {
    const { error: questionsError } = await supabase.from("ats_job_questions").insert(
      questions.map((question, index) => ({
        job_posting_id: jobId,
        question,
        display_order: index,
      }))
    );
    if (questionsError) {
      // A vaga já foi criada com sucesso — perder as perguntas não deve
      // fazer o admin achar que a criação inteira falhou (ele pode
      // reenviar o formulário e duplicar a vaga). Só loga pro time
      // investigar; a vaga fica sem perguntas customizadas.
      console.error("[admin] falha ao salvar perguntas da vaga", questionsError);
    }
  }

  revalidatePath("/vagas-admin");
  return { status: "idle" };
}

export interface SavedJobQuestion {
  id: string;
  question: string;
  archived: boolean;
  answerCount: number;
}

export interface UpdateJobPostingState {
  status: "idle" | "success" | "error";
  message?: string;
  /**
   * Lista de perguntas como ficou no banco depois de salvar. O formulário
   * ressincroniza o estado local com isto — sem ela, uma pergunta recém-criada
   * continuaria sem `id` na tela e um segundo "Salvar" a inseriria de novo.
   */
  questions?: SavedJobQuestion[];
}

/** Estado das perguntas da vaga como está no banco, pro formulário ressincronizar. */
async function readSavedQuestions(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  jobId: string
): Promise<SavedJobQuestion[] | undefined> {
  const { data: questions, error } = await supabase
    .from("ats_job_questions")
    .select("id, question, archived_at")
    .eq("job_posting_id", jobId)
    .order("display_order", { ascending: true });

  if (error || !questions) return undefined;

  const ids = questions.map((q) => q.id);
  const { data: answers } =
    ids.length > 0
      ? await supabase.from("ats_application_answers").select("question_id").in("question_id", ids)
      : { data: [] };

  const counts = new Map<string, number>();
  for (const row of answers ?? []) {
    counts.set(row.question_id, (counts.get(row.question_id) ?? 0) + 1);
  }

  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    archived: q.archived_at !== null,
    answerCount: counts.get(q.id) ?? 0,
  }));
}

/** Item da lista de perguntas enviada pelo formulário de edição (JSON). */
interface QuestionPayloadItem {
  /** Ausente = pergunta nova. Presente = pergunta existente desta vaga. */
  id?: string;
  question: string;
  archived?: boolean;
}

type ParseResult =
  | { ok: true; items: QuestionPayloadItem[] }
  | { ok: false; message: string };

const MALFORMED_PAYLOAD_MESSAGE =
  "Não foi possível ler as perguntas. Recarregue a página e tente de novo.";

function parseQuestionsPayload(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, message: MALFORMED_PAYLOAD_MESSAGE };
  }
  if (!Array.isArray(parsed)) return { ok: false, message: MALFORMED_PAYLOAD_MESSAGE };

  const items: QuestionPayloadItem[] = [];
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, message: MALFORMED_PAYLOAD_MESSAGE };
    }
    const obj = entry as Record<string, unknown>;
    const question = typeof obj.question === "string" ? obj.question.trim() : "";
    const id = typeof obj.id === "string" && obj.id ? obj.id : undefined;
    // Pergunta nova em branco é só uma linha vazia que o admin não preencheu —
    // ignora. Pergunta EXISTENTE em branco é erro de verdade: apagar o texto
    // de uma pergunta já publicada não é o mesmo que removê-la (e salvar
    // assim deixaria candidato futuro olhando pra um campo sem enunciado).
    if (!question) {
      if (id) {
        return {
          ok: false,
          message: "Uma das perguntas ficou sem texto. Preencha ou use o X para removê-la.",
        };
      }
      continue;
    }
    items.push({ id, question, archived: obj.archived === true });
  }
  return { ok: true, items };
}

/**
 * Edita uma vaga já publicada — campos de texto e perguntas customizadas.
 *
 * Três invariantes que a implementação mantém de propósito:
 *
 * 1. **O slug nunca muda.** Ele é derivado do título só na criação. Regerar
 *    o slug ao editar o título quebraria todo link já divulgado (WhatsApp,
 *    LinkedIn, e-mail) com um 404 silencioso.
 * 2. **Resposta de candidato nunca é apagada.** Remover uma pergunta que já
 *    tem resposta arquiva (`archived_at`), não deleta. Só some do banco a
 *    pergunta que ninguém respondeu.
 * 3. **Candidatura existente nunca é invalidada.** Perguntas adicionadas
 *    depois valem só pra quem se candidatar a partir de agora; o pipeline
 *    sinaliza a lacuna em vez de tratar como "candidato não respondeu".
 */
export async function updateJobPosting(
  _prev: UpdateJobPostingState,
  formData: FormData
): Promise<UpdateJobPostingState> {
  await requireAdmin();

  const jobId = String(formData.get("job_id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const requirements = String(formData.get("requirements") || "").trim();

  if (!jobId) {
    return { status: "error", message: "Vaga não identificada." };
  }
  if (!title || !description || !requirements) {
    return { status: "error", message: "Preencha título, descrição e requisitos." };
  }

  const parsedQuestions = parseQuestionsPayload(String(formData.get("questions_payload") || "[]"));
  if (!parsedQuestions.ok) {
    return { status: "error", message: parsedQuestions.message };
  }
  const questions = parsedQuestions.items;

  const supabase = getSupabaseAdminClient();

  const { data: current, error: currentError } = await supabase
    .from("ats_job_postings")
    .select("id, title, description, requirements")
    .eq("id", jobId)
    .maybeSingle();

  if (currentError || !current) {
    return { status: "error", message: "Vaga não encontrada." };
  }

  const now = new Date().toISOString();
  const contentChanged =
    current.title !== title ||
    current.description !== description ||
    current.requirements !== requirements;

  const { error: updateError } = await supabase
    .from("ats_job_postings")
    .update({
      title,
      description,
      requirements,
      updated_at: now,
      // Só marca quando o TEXTO muda — mexer só nas perguntas não torna os
      // scores antigos incomparáveis (o score é calculado sobre descrição e
      // requisitos, não sobre as perguntas).
      ...(contentChanged ? { content_updated_at: now } : {}),
    })
    .eq("id", jobId);

  if (updateError) {
    console.error("[admin] falha ao editar vaga", updateError);
    return { status: "error", message: "Não foi possível salvar as alterações da vaga." };
  }

  // --- Perguntas ---------------------------------------------------------

  const { data: existing, error: existingError } = await supabase
    .from("ats_job_questions")
    .select("id, question, display_order, archived_at")
    .eq("job_posting_id", jobId);

  if (existingError) {
    console.error("[admin] falha ao carregar perguntas da vaga", existingError);
    return { status: "error", message: "A vaga foi salva, mas não foi possível atualizar as perguntas." };
  }

  const existingById = new Map((existing ?? []).map((q) => [q.id, q]));

  // O payload vem do client: um `id` só é aceito se pertencer A ESTA vaga.
  // Sem isso, um POST forjado poderia editar/arquivar pergunta de outra vaga.
  for (const item of questions) {
    if (item.id && !existingById.has(item.id)) {
      return { status: "error", message: "Lista de perguntas desatualizada. Recarregue a página e tente de novo." };
    }
  }

  const payloadIds = new Set(questions.filter((q) => q.id).map((q) => q.id as string));
  // Pergunta que sumiu do payload = removida na tela. Some do formulário
  // público do mesmo jeito que uma marcada como `archived`.
  const removedIds = (existing ?? []).filter((q) => !payloadIds.has(q.id)).map((q) => q.id);
  const archivedIds = new Set([
    ...removedIds,
    ...questions.filter((q) => q.id && q.archived).map((q) => q.id as string),
  ]);

  // Quantas respostas cada pergunta a arquivar já tem: com zero, dá pra
  // apagar de verdade e manter a lista limpa; com uma que seja, arquiva.
  const answerCounts = new Map<string, number>();
  if (archivedIds.size > 0) {
    const { data: answers, error: answersError } = await supabase
      .from("ats_application_answers")
      .select("question_id")
      .in("question_id", [...archivedIds]);

    if (answersError) {
      console.error("[admin] falha ao contar respostas das perguntas", answersError);
      return { status: "error", message: "A vaga foi salva, mas não foi possível atualizar as perguntas." };
    }
    for (const row of answers ?? []) {
      answerCounts.set(row.question_id, (answerCounts.get(row.question_id) ?? 0) + 1);
    }
  }

  const errors: unknown[] = [];

  // display_order só considera as perguntas ativas, na ordem da tela.
  let order = 0;
  for (const item of questions) {
    const isArchived = item.id ? archivedIds.has(item.id) : false;
    const displayOrder = isArchived ? 0 : order++;

    if (!item.id) {
      const { error } = await supabase.from("ats_job_questions").insert({
        job_posting_id: jobId,
        question: item.question,
        display_order: displayOrder,
      });
      if (error) errors.push(error);
      continue;
    }

    const previous = existingById.get(item.id);
    const { error } = await supabase
      .from("ats_job_questions")
      .update({
        question: item.question,
        display_order: displayOrder,
        // Reativar uma pergunta arquivada é só zerar o campo — as respostas
        // antigas dela nunca saíram do lugar.
        archived_at: isArchived ? (previous?.archived_at ?? now) : null,
      })
      .eq("id", item.id)
      .eq("job_posting_id", jobId);
    if (error) errors.push(error);
  }

  for (const id of removedIds) {
    const hasAnswers = (answerCounts.get(id) ?? 0) > 0;
    if (hasAnswers) {
      const previous = existingById.get(id);
      // Já estava arquivada — não reescreve a data original.
      if (previous?.archived_at) continue;
      const { error } = await supabase
        .from("ats_job_questions")
        .update({ archived_at: now })
        .eq("id", id)
        .eq("job_posting_id", jobId);
      if (error) errors.push(error);
    } else {
      const { error } = await supabase
        .from("ats_job_questions")
        .delete()
        .eq("id", id)
        .eq("job_posting_id", jobId);
      if (error) errors.push(error);
    }
  }

  revalidatePath("/vagas-admin");
  revalidatePath(`/vagas-admin/${jobId}`);
  revalidatePath(`/vagas-admin/${jobId}/editar`);
  revalidatePath(`/vagas-admin/${jobId}/pipeline`);
  // A página pública lê por slug, não por id — revalida pela rota dinâmica.
  revalidatePath("/vagas/[slug]", "page");

  const saved = await readSavedQuestions(supabase, jobId);

  if (errors.length > 0) {
    console.error("[admin] falha ao atualizar perguntas da vaga", errors);
    return {
      status: "error",
      message:
        "Os dados da vaga foram salvos, mas algumas perguntas não puderam ser atualizadas. Confira a lista abaixo.",
      questions: saved,
    };
  }

  return { status: "success", questions: saved };
}

export async function updateJobPostingStatus(jobId: string, status: string): Promise<void> {
  await requireAdmin();

  if (!JOB_STATUSES.includes(status as JobStatus)) {
    throw new Error("Status inválido.");
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("ats_job_postings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", jobId);

  if (error) {
    console.error("[admin] falha ao atualizar status da vaga", error);
    throw new Error("Não foi possível atualizar o status.");
  }

  revalidatePath("/vagas-admin");
  revalidatePath(`/vagas-admin/${jobId}`);
}

export async function updateApplicationStatus(
  applicationId: string,
  jobId: string,
  status: string
): Promise<void> {
  await requireAdmin();

  if (!APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
    throw new Error("Status inválido.");
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("ats_applications")
    .update({ pipeline_status: status, updated_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (error) {
    console.error("[admin] falha ao atualizar status da candidatura", error);
    throw new Error("Não foi possível atualizar o status.");
  }

  if (status === "rejeitado") {
    await maybeSendRejectionEmail(supabase, applicationId, jobId);
  }

  revalidatePath(`/vagas-admin/${jobId}`);
}
