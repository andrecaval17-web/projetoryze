/**
 * Lógica pura da régua de aderência do ATS — nada aqui chama a IA, então é
 * testável sem rede (ver src/lib/ats/scoring.test.ts). O modelo só avalia
 * aderência a requisitos/descrição (`score`) e identifica os empregos do
 * currículo; a permanência (tempo de casa) e o cruzamento com a área da vaga
 * são calculados em código a partir do que o modelo extraiu, nunca pelo
 * próprio modelo — isso evita que a "nota" dependa de o modelo saber fazer
 * conta de data, e permite reauditar/testar a régua sem chamar a API de novo.
 */

export const JOB_TYPES = ["clt", "estagio", "temporario", "pj", "outro"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const AREA_FITS = ["alta", "media", "baixa", "nenhuma"] as const;
export type AreaFit = (typeof AREA_FITS)[number];

export interface JobEntry {
  company: string;
  title: string;
  /** "YYYY-MM", ou null quando o currículo não informa a data (nunca inventada pelo modelo). */
  start: string | null;
  /** "YYYY-MM", "atual" (emprego em andamento), ou null. */
  end: string | "atual" | null;
  type: JobType;
}

export interface ModelScoreResult {
  jobs: JobEntry[];
  area_fit: AreaFit;
  area_fit_reason: string;
  /** Nota do modelo — SÓ aderência a requisitos/descrição, sem considerar permanência. */
  score: number;
  reasoning: string;
}

/** Mensagem gravada em `score_reasoning` quando a avaliação por IA falha — nunca fica um score 0 parecendo um julgamento real. */
export const AI_FAILURE_REASONING =
  "⚠ Avaliação automática indisponível — revisar o currículo manualmente.";

const FIVE_YEARS_MS = 5 * 365.25 * 24 * 60 * 60 * 1000;
const MIN_JOBS_FOR_PERMANENCE_RULE = 2;
const SHORT_TENURE_MONTHS = 12;
const SHORT_STINT_THRESHOLD = 3;
const PERMANENCE_CAP = 60;
const AREA_FIT_NONE_CAP = 40;

function isJobType(value: unknown): value is JobType {
  return typeof value === "string" && (JOB_TYPES as readonly string[]).includes(value);
}

function isAreaFit(value: unknown): value is AreaFit {
  return typeof value === "string" && (AREA_FITS as readonly string[]).includes(value);
}

function parseStartField(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}$/.test(value) ? value : null;
}

function parseEndField(value: unknown): string | "atual" | null {
  if (value === "atual") return "atual";
  return typeof value === "string" && /^\d{4}-\d{2}$/.test(value) ? value : null;
}

function parseJobEntry(raw: unknown): JobEntry | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  return {
    company: typeof obj.company === "string" ? obj.company : "",
    title: typeof obj.title === "string" ? obj.title : "",
    start: parseStartField(obj.start),
    end: parseEndField(obj.end),
    type: isJobType(obj.type) ? obj.type : "outro",
  };
}

/**
 * Faz o parse da resposta JSON do modelo, com defaults seguros pra qualquer
 * campo ausente/malformado — nunca lança por conta de um campo faltando.
 * `area_fit` ausente cai em "media" (neutro, sem cap), nunca em "nenhuma"
 * (que aplicaria um cap punitivo sem o modelo ter de fato dito isso).
 */
export function parseModelScoreJson(content: string): ModelScoreResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned);
  }
  const obj = (parsed ?? {}) as Record<string, unknown>;
  const jobsRaw = Array.isArray(obj.jobs) ? obj.jobs : [];
  const jobs = jobsRaw
    .map(parseJobEntry)
    .filter((job): job is JobEntry => job !== null);

  return {
    jobs,
    area_fit: isAreaFit(obj.area_fit) ? obj.area_fit : "media",
    area_fit_reason: typeof obj.area_fit_reason === "string" ? obj.area_fit_reason : "",
    score: typeof obj.score === "number" ? Math.max(0, Math.min(100, Math.round(obj.score))) : 0,
    reasoning: typeof obj.reasoning === "string" ? obj.reasoning : "",
  };
}

function parseYearMonth(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return new Date(Date.UTC(year, month - 1, 1));
}

function monthsBetween(start: Date, end: Date): number {
  return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
}

interface JobDuration {
  job: JobEntry;
  months: number;
  endDate: Date;
}

/** Empregos com `start` ou `end` nulos são ignorados — nunca inferidos. */
function computeJobDurations(jobs: JobEntry[], today: Date): JobDuration[] {
  const durations: JobDuration[] = [];
  for (const job of jobs) {
    if (!job.start || !job.end) continue;
    const startDate = parseYearMonth(job.start);
    const endDate = job.end === "atual" ? today : parseYearMonth(job.end);
    if (!startDate || !endDate) continue;
    const months = monthsBetween(startDate, endDate);
    if (months < 0) continue;
    durations.push({ job, months, endDate });
  }
  return durations;
}

export interface TenureStats {
  averageMonths: number;
  shortStintCount: number;
  consideredJobCount: number;
}

/**
 * Média de permanência e contagem de passagens curtas, só sobre empregos com
 * datas válidas que terminaram (ou estão ativos) nos últimos 5 anos.
 * Estágio e temporário são excluídos do cálculo inteiro (média e contagem) —
 * são posições curtas por natureza, não um indício de rotatividade.
 * Retorna `null` quando há menos de 2 empregos elegíveis (regra não se aplica).
 */
export function calculateTenureStats(jobs: JobEntry[], today: Date): TenureStats | null {
  const relevant = computeJobDurations(jobs, today).filter(
    (d) => today.getTime() - d.endDate.getTime() <= FIVE_YEARS_MS && d.job.type !== "estagio" && d.job.type !== "temporario"
  );

  if (relevant.length < MIN_JOBS_FOR_PERMANENCE_RULE) return null;

  const totalMonths = relevant.reduce((sum, d) => sum + d.months, 0);
  return {
    averageMonths: totalMonths / relevant.length,
    shortStintCount: relevant.filter((d) => d.months < SHORT_TENURE_MONTHS).length,
    consideredJobCount: relevant.length,
  };
}

export interface ScoreCapResult {
  originalScore: number;
  cappedScore: number;
  /** Linhas "⚠ ..." a colocar no início de `score_reasoning`, na ordem em que devem aparecer. */
  alerts: string[];
}

/**
 * Aplica os caps de nota (permanência baixa, área sem relação) sobre a nota
 * do modelo — sempre o MENOR cap entre os que se aplicarem.
 */
export function applyScoreCaps(
  modelScore: number,
  jobs: JobEntry[],
  areaFit: AreaFit,
  areaFitReason: string,
  today: Date
): ScoreCapResult {
  const alerts: string[] = [];
  const caps: number[] = [];

  const tenure = calculateTenureStats(jobs, today);
  if (tenure) {
    const lowAverage = tenure.averageMonths < SHORT_TENURE_MONTHS;
    const manyShortStints = tenure.shortStintCount >= SHORT_STINT_THRESHOLD;
    if (lowAverage || manyShortStints) {
      caps.push(PERMANENCE_CAP);
      alerts.push(
        `⚠ Permanência baixa: média de ${Math.round(tenure.averageMonths)} meses por empresa; ${tenure.shortStintCount} passagens com menos de 1 ano nos últimos 5 anos.`
      );
    }
  }

  if (areaFit === "nenhuma") {
    caps.push(AREA_FIT_NONE_CAP);
    alerts.push(`⚠ Área sem relação com a vaga: ${areaFitReason}`);
  } else if (areaFit === "baixa") {
    alerts.push(`⚠ Pouca relação com a área da vaga: ${areaFitReason}`);
  }

  const cappedScore = caps.length > 0 ? Math.min(modelScore, ...caps) : modelScore;

  return { originalScore: modelScore, cappedScore, alerts };
}

/**
 * Monta o texto final de `score_reasoning`: alertas (cada um "⚠ ...") no
 * início, seguidos da nota original/limitada (só quando um cap reduziu a
 * nota) e por fim o reasoning do modelo.
 */
export function buildScoreReasoning(capResult: ScoreCapResult, modelReasoning: string): string {
  const lines = [...capResult.alerts];
  if (capResult.cappedScore < capResult.originalScore) {
    lines.push(`Nota original do modelo: ${capResult.originalScore}, limitada a ${capResult.cappedScore}.`);
  }
  if (modelReasoning) lines.push(modelReasoning);
  return lines.join("\n");
}

export interface FinalScoreResult {
  score: number;
  scoreReasoning: string;
}

/** Combina o resultado do modelo com os caps calculados em código — ponto único chamado pelos callers (candidatura pública e reavaliação em lote). */
export function computeFinalScore(modelResult: ModelScoreResult, today: Date = new Date()): FinalScoreResult {
  const capResult = applyScoreCaps(
    modelResult.score,
    modelResult.jobs,
    modelResult.area_fit,
    modelResult.area_fit_reason,
    today
  );
  return {
    score: capResult.cappedScore,
    scoreReasoning: buildScoreReasoning(capResult, modelResult.reasoning),
  };
}
