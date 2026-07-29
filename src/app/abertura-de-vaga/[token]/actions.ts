"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  JOB_STATUS_OPTIONS,
  EXPERIENCE_TIME_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
} from "@/lib/job-request-options";

export interface SubmitJobRequestState {
  status: "idle" | "success" | "error";
  message?: string;
}

const JOB_STATUS_VALUES = JOB_STATUS_OPTIONS.map((o) => o.value);
const EXPERIENCE_TIME_VALUES = EXPERIENCE_TIME_OPTIONS.map((o) => o.value);
const EDUCATION_LEVEL_VALUES = EDUCATION_LEVEL_OPTIONS.map((o) => o.value);

export async function submitJobOpeningRequest(
  token: string,
  _prev: SubmitJobRequestState,
  formData: FormData
): Promise<SubmitJobRequestState> {
  const supabase = getSupabaseAdminClient();

  // Confirma que o token ainda é válido (existe e não foi usado) antes de
  // gravar qualquer coisa — reenvio de um link já usado (aba antiga aberta,
  // duplo clique) vira erro explícito, não uma segunda linha.
  const { data: existing, error: fetchError } = await supabase
    .from("ats_job_requests")
    .select("id, submitted_at")
    .eq("token", token)
    .maybeSingle();

  if (fetchError || !existing) {
    return { status: "error", message: "Link inválido ou expirado." };
  }
  if (existing.submitted_at) {
    return { status: "error", message: "Esta solicitação já foi enviada." };
  }

  const get = (key: string) => String(formData.get(key) || "").trim();

  const companyName = get("company_name");
  const requesterName = get("requester_name");
  const requesterRole = get("requester_role");
  const requesterDepartment = get("requester_department");
  const requesterManager = get("requester_manager");
  const jobTitle = get("job_title");
  const jobStatus = get("job_status");
  const salaryComposition = get("salary_composition");
  const benefits = get("benefits");
  const bonus = get("bonus");
  const workSchedule = get("work_schedule");
  const requiresExperience = formData.get("requires_experience") === "sim";
  const requiresPcd = formData.get("requires_pcd") === "sim";
  const experienceTime = get("experience_time");
  const educationLevel = get("education_level");
  const educationNotes = get("education_notes");
  const technicalKnowledge = get("technical_knowledge");
  const computerSkills = get("computer_skills");
  const behavioralTraits = formData.getAll("behavioral_traits").map(String);
  const particularities = get("particularities");
  const candidateDifferential = get("candidate_differential");

  if (
    !companyName ||
    !requesterName ||
    !requesterRole ||
    !requesterDepartment ||
    !requesterManager ||
    !jobTitle ||
    !jobStatus ||
    !salaryComposition ||
    !benefits ||
    !workSchedule ||
    !educationLevel ||
    !technicalKnowledge ||
    !computerSkills ||
    behavioralTraits.length === 0 ||
    !particularities ||
    !candidateDifferential
  ) {
    return { status: "error", message: "Preencha todos os campos obrigatórios." };
  }
  if (!JOB_STATUS_VALUES.includes(jobStatus as (typeof JOB_STATUS_VALUES)[number])) {
    return { status: "error", message: "Situação da vaga inválida." };
  }
  if (!EDUCATION_LEVEL_VALUES.includes(educationLevel as (typeof EDUCATION_LEVEL_VALUES)[number])) {
    return { status: "error", message: "Formação acadêmica inválida." };
  }
  if (requiresExperience && !EXPERIENCE_TIME_VALUES.includes(experienceTime as (typeof EXPERIENCE_TIME_VALUES)[number])) {
    return { status: "error", message: "Informe o tempo de experiência exigido." };
  }

  const { error } = await supabase
    .from("ats_job_requests")
    .update({
      company_name: companyName,
      requester_name: requesterName,
      requester_role: requesterRole,
      requester_department: requesterDepartment,
      requester_manager: requesterManager,
      job_title: jobTitle,
      job_status: jobStatus,
      salary_composition: salaryComposition,
      benefits,
      bonus: bonus || null,
      work_schedule: workSchedule,
      requires_experience: requiresExperience,
      requires_pcd: requiresPcd,
      experience_time: requiresExperience ? experienceTime : null,
      education_level: educationLevel,
      education_notes: educationNotes || null,
      technical_knowledge: technicalKnowledge,
      computer_skills: computerSkills,
      behavioral_traits: behavioralTraits,
      particularities,
      candidate_differential: candidateDifferential,
      status: "em_revisao",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("token", token);

  if (error) {
    console.error("Failed to submit job opening request", error);
    return { status: "error", message: "Não foi possível enviar agora. Tente novamente." };
  }

  return { status: "success" };
}
