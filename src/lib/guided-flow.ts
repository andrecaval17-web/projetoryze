/**
 * Lógica única do fluxo guiado Currículo → LinkedIn → Entrevista, pra mesma
 * vaga (`job_applications`, ver 0010_job_applications.sql). Usada tanto
 * pelos pontinhos de progresso no histórico do currículo (`JobFlowDots` em
 * curriculo-workspace.tsx) quanto pelo cartão de onboarding no hub — nenhum
 * dos dois duplica o cálculo, os dois leem os mesmos 3 campos.
 */
export interface JobApplicationFlow {
  id: string;
  linkedin_analysis_id: string | null;
  interview_session_id: string | null;
}

export interface JobFlowStep {
  label: string;
  done: boolean;
}

export function getJobFlowSteps(jobApplication: JobApplicationFlow): JobFlowStep[] {
  return [
    { label: "Currículo", done: true },
    { label: "LinkedIn", done: !!jobApplication.linkedin_analysis_id },
    { label: "Entrevista", done: !!jobApplication.interview_session_id },
  ];
}

export function isJobFlowComplete(jobApplication: JobApplicationFlow): boolean {
  return !!jobApplication.linkedin_analysis_id && !!jobApplication.interview_session_id;
}

/** Próximo passo pendente pra essa vaga, ou `null` se currículo+LinkedIn+entrevista já foram feitos. */
export function getJobFlowNextHref(jobApplication: JobApplicationFlow): string | null {
  if (!jobApplication.linkedin_analysis_id) {
    return `/para-candidatos/painel/linkedin?vaga=${jobApplication.id}`;
  }
  if (!jobApplication.interview_session_id) {
    return `/para-candidatos/painel/entrevista?vaga=${jobApplication.id}`;
  }
  return null;
}

/**
 * Escolhe a "vaga atual" pro cartão de onboarding: a mais recente que ainda
 * não terminou LinkedIn+Entrevista. Se todas as vagas já estiverem completas
 * (ou não houver nenhuma), cai pra mais recente mesmo assim — mantém o
 * contexto de vaga nos links dos passos 3/4 em vez de voltar pras versões
 * genéricas das páginas.
 */
export function pickCurrentJobApplication<T extends JobApplicationFlow>(all: T[]): T | null {
  if (all.length === 0) return null;
  return all.find((ja) => !isJobFlowComplete(ja)) ?? all[0];
}

/**
 * Os 5 passos da jornada sugerida pro candidato pago — a "apresentação" do
 * fluxo guiado acima, não um estado novo: `done` de cada passo vem só das
 * tabelas que já existem (perfil, job_applications, mentoring_sessions),
 * nunca de uma flag de progresso gravada à parte. Ver proposta em
 * HANDOFF.md sobre por que isso não duplica o Painel de evolução.
 */
export interface OnboardingStep {
  key: "perfil" | "adaptar" | "linkedin" | "entrevista" | "mentoria";
  title: string;
  description: string;
  href: string;
  done: boolean;
  /** Passo do plano Mentoria, indisponível pra quem está no Impulso. */
  locked: boolean;
}

export interface OnboardingJourneyParams {
  hasProfile: boolean;
  jobApplication: JobApplicationFlow | null;
  hasMentoriaConfirmed: boolean;
  isMentoriaPlan: boolean;
}

export function getOnboardingJourney({
  hasProfile,
  jobApplication,
  hasMentoriaConfirmed,
  isMentoriaPlan,
}: OnboardingJourneyParams): OnboardingStep[] {
  const vagaSuffix = jobApplication ? `?vaga=${jobApplication.id}` : "";

  return [
    {
      key: "perfil",
      title: "Complete seu perfil e gere seu currículo",
      description: "A base de tudo — a IA usa esses dados em todas as outras ferramentas.",
      href: "/para-candidatos/painel/curriculo",
      done: hasProfile,
      locked: false,
    },
    {
      key: "adaptar",
      title: "Adapte seu currículo para uma vaga específica",
      description: "Cole o título e a descrição da vaga — a IA monta uma versão focada nela.",
      href: "/para-candidatos/painel/curriculo",
      done: !!jobApplication,
      locked: false,
    },
    {
      key: "linkedin",
      title: "Analise seu perfil do LinkedIn",
      description: "Envie o PDF do seu perfil e receba sugestões de melhoria para essa vaga.",
      href: `/para-candidatos/painel/linkedin${vagaSuffix}`,
      done: !!jobApplication?.linkedin_analysis_id,
      locked: false,
    },
    {
      key: "entrevista",
      title: "Treine a entrevista para essa vaga",
      description: "Simule uma entrevista real por voz com a IA entrevistadora.",
      href: `/para-candidatos/painel/entrevista${vagaSuffix}`,
      done: !!jobApplication?.interview_session_id,
      locked: false,
    },
    {
      key: "mentoria",
      title: "Agende sua sessão de mentoria",
      description: "Converse com um consultor de recolocação de verdade, 30 minutos por mês.",
      href: "/para-candidatos/painel/mentoria",
      done: hasMentoriaConfirmed,
      locked: !isMentoriaPlan,
    },
  ];
}

/** Índice do primeiro passo não concluído (mesmo se travado — a UI decide como mostrar esse caso). */
export function getCurrentOnboardingStepIndex(steps: OnboardingStep[]): number {
  const idx = steps.findIndex((s) => !s.done);
  return idx === -1 ? steps.length : idx;
}
