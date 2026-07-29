"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export interface CreateJobRequestState {
  status: "idle" | "success" | "error";
  message?: string;
  link?: string;
}

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Gera o link de Abertura de Vaga pra uma empresa. Todos os campos além de
 * `company_name` são opcionais aqui — em branco, o link funciona como hoje
 * (a empresa preenche tudo); preenchidos, a empresa vê os campos já
 * prontos e só confirma/ajusta (pedido do cliente em 2026-07-29).
 */
export async function createJobOpeningRequest(
  _prev: CreateJobRequestState,
  formData: FormData
): Promise<CreateJobRequestState> {
  const session = await requireAdmin();

  const companyName = String(formData.get("company_name") || "").trim();
  if (!companyName) {
    return { status: "error", message: "Informe o nome da empresa." };
  }

  const get = (key: string) => {
    const v = String(formData.get(key) || "").trim();
    return v || null;
  };

  const behavioralTraits = formData.getAll("behavioral_traits").map(String).filter(Boolean);
  const requiresExperienceRaw = formData.get("requires_experience");
  const requiresPcdRaw = formData.get("requires_pcd");

  const supabase = getSupabaseAdminClient();
  const token = crypto.randomUUID();

  const { error } = await supabase.from("ats_job_requests").insert({
    token,
    company_name: companyName,
    requester_name: get("requester_name"),
    requester_role: get("requester_role"),
    requester_department: get("requester_department"),
    requester_manager: get("requester_manager"),
    job_title: get("job_title"),
    job_status: get("job_status"),
    salary_composition: get("salary_composition"),
    benefits: get("benefits"),
    bonus: get("bonus"),
    work_schedule: get("work_schedule"),
    requires_experience: requiresExperienceRaw ? requiresExperienceRaw === "sim" : null,
    requires_pcd: requiresPcdRaw ? requiresPcdRaw === "sim" : null,
    experience_time: get("experience_time"),
    education_level: get("education_level"),
    education_notes: get("education_notes"),
    technical_knowledge: get("technical_knowledge"),
    computer_skills: get("computer_skills"),
    behavioral_traits: behavioralTraits,
    particularities: get("particularities"),
    candidate_differential: get("candidate_differential"),
    created_by: session.userId,
  });

  if (error) {
    console.error("[admin] falha ao criar solicitação de abertura de vaga", error);
    return { status: "error", message: "Não foi possível gerar o link agora." };
  }

  const baseUrl = await getBaseUrl();
  revalidatePath("/vagas-admin/aberturas");
  return { status: "success", link: `${baseUrl}/abertura-de-vaga/${token}` };
}

export async function archiveJobOpeningRequest(requestId: string): Promise<void> {
  await requireAdmin();
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("ats_job_requests")
    .update({ status: "arquivada", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    console.error("[admin] falha ao arquivar solicitação", error);
    throw new Error("Não foi possível arquivar a solicitação.");
  }

  revalidatePath("/vagas-admin/aberturas");
  revalidatePath(`/vagas-admin/aberturas/${requestId}`);
}
