"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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
  // Perguntas customizadas: só na criação da vaga (sem edição posterior por
  // enquanto — decisão explícita da proposta aprovada em 2026-07-24).
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

  revalidatePath(`/vagas-admin/${jobId}`);
}
