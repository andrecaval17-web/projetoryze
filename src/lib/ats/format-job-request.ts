import {
  jobStatusLabel,
  experienceTimeLabel,
  educationLevelLabel,
  type JobRequestRow,
} from "@/lib/job-request-options";

/**
 * Monta um rascunho de descrição/requisitos a partir dos campos
 * estruturados da solicitação — ponto de partida pro admin editar em
 * "Criar vaga a partir desta solicitação" (src/app/vagas-admin/page.tsx),
 * nunca publicado sem revisão humana (a vaga nasce "pausada").
 */
export function buildDescriptionDraft(req: JobRequestRow): string {
  const lines: string[] = [];

  if (req.salary_composition) lines.push(`Composição salarial: ${req.salary_composition}`);
  if (req.benefits) lines.push(`Benefícios: ${req.benefits}`);
  if (req.bonus) lines.push(`Premiação: ${req.bonus}`);
  if (req.work_schedule) lines.push(`Horário de trabalho: ${req.work_schedule}`);
  if (req.job_status) lines.push(`Situação da vaga: ${jobStatusLabel(req.job_status)}`);

  return lines.join("\n\n");
}

export function buildRequirementsDraft(req: JobRequestRow): string {
  const lines: string[] = [];

  if (req.requires_experience) {
    const time = req.experience_time ? ` (${experienceTimeLabel(req.experience_time)})` : "";
    lines.push(`Experiência exigida${time}`);
  }
  if (req.education_level) {
    const notes = req.education_notes ? ` — ${req.education_notes}` : "";
    lines.push(`Formação: ${educationLevelLabel(req.education_level)}${notes}`);
  }
  if (req.technical_knowledge) lines.push(`Conhecimento técnico: ${req.technical_knowledge}`);
  if (req.computer_skills) lines.push(`Informática: ${req.computer_skills}`);
  if (req.behavioral_traits?.length) lines.push(`Perfil comportamental: ${req.behavioral_traits.join(", ")}`);
  if (req.particularities) lines.push(`Particularidade da vaga: ${req.particularities}`);
  if (req.candidate_differential) lines.push(`Diferencial desejado: ${req.candidate_differential}`);
  if (req.requires_pcd) lines.push(`Vaga também aberta para PCD.`);

  return lines.join("\n\n");
}
