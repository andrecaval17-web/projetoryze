// Opções fixas do formulário de Abertura de Vaga — usadas tanto no
// formulário público (/abertura-de-vaga/[token]) quanto no painel
// (/vagas-admin/aberturas), pra manter os mesmos rótulos/valores nos dois
// lugares sem duplicar a lista.

export const JOB_STATUS_OPTIONS = [
  { value: "ocupada", label: "Ocupada" },
  { value: "em_aberto", label: "Em aberto" },
  { value: "sigilosa", label: "Sigilosa" },
] as const;
export type JobRequestStatus = (typeof JOB_STATUS_OPTIONS)[number]["value"];

export const EXPERIENCE_TIME_OPTIONS = [
  { value: "ate_6_meses", label: "Até 6 meses" },
  { value: "6_meses_a_2_anos", label: "De 6 meses a 2 anos" },
  { value: "3_anos_ou_mais", label: "3 anos ou mais" },
] as const;
export type ExperienceTime = (typeof EXPERIENCE_TIME_OPTIONS)[number]["value"];

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "fundamental", label: "Ensino Fundamental" },
  { value: "medio", label: "Ensino Médio" },
  { value: "graduacao", label: "Graduação" },
  { value: "pos_graduacao", label: "Pós-Graduação" },
  { value: "mestrado_doutorado", label: "Mestrado/Doutorado" },
] as const;
export type EducationLevel = (typeof EDUCATION_LEVEL_OPTIONS)[number]["value"];

// Lista original da planilha tinha "Atenção aos detalhes" repetido —
// deduplicada aqui.
export const BEHAVIORAL_TRAITS = [
  "Capacidade de Interpretação",
  "Comunicação",
  "Relacionamento Interpessoal",
  "Criatividade",
  "Empatia",
  "Organização",
  "Simpatia",
  "Dinamismo",
  "Proatividade",
  "Persuasão",
  "Extrovertido",
  "Controle Emocional",
  "Ética",
  "Flexibilidade",
  "Tomada de Decisões",
  "Reservado",
  "Maduro",
  "Focado em Resultado",
  "Atenção aos Detalhes",
  "Iniciativa",
  "Adaptabilidade para Mudanças",
  "Capacidade Analítica",
  "Capacidade de Cálculos Matemáticos",
  "Desenvolvimento de Pessoas",
  "Liderança",
  "Capacidade de Negociação",
  "Planejamento",
  "Centrado",
  "Concentrado",
  "Perfil Analítico",
] as const;

export function jobStatusLabel(value: string | null): string {
  return JOB_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

export function experienceTimeLabel(value: string | null): string {
  return EXPERIENCE_TIME_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

export function educationLevelLabel(value: string | null): string {
  return EDUCATION_LEVEL_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

export interface JobRequestRow {
  id: string;
  token: string;
  company_name: string;
  requester_name: string | null;
  requester_role: string | null;
  requester_department: string | null;
  requester_manager: string | null;
  job_title: string | null;
  job_status: string | null;
  salary_composition: string | null;
  benefits: string | null;
  bonus: string | null;
  work_schedule: string | null;
  requires_experience: boolean | null;
  requires_pcd: boolean | null;
  experience_time: string | null;
  education_level: string | null;
  education_notes: string | null;
  technical_knowledge: string | null;
  computer_skills: string | null;
  behavioral_traits: string[];
  particularities: string | null;
  candidate_differential: string | null;
  status: "pendente" | "em_revisao" | "convertida" | "arquivada";
  converted_job_posting_id: string | null;
  created_at: string;
  submitted_at: string | null;
}
