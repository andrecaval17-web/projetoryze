export interface ResumeContact {
  email: string;
  telefone: string;
  linkedin: string;
}

/** Mês em "01".."12"; ano em "AAAA". Campos vazios = não informado. */
export interface ResumePeriod {
  inicioMes: string;
  inicioAno: string;
  fimMes: string;
  fimAno: string;
  /** Quando true, os campos de fim são ignorados na exibição (cargo/curso em andamento). */
  atual: boolean;
}

export const emptyPeriod: ResumePeriod = {
  inicioMes: "",
  inicioAno: "",
  fimMes: "",
  fimAno: "",
  atual: false,
};

export const MONTH_OPTIONS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Fev" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Abr" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Ago" },
  { value: "09", label: "Set" },
  { value: "10", label: "Out" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dez" },
] as const;

function formatMonthYear(mes: string, ano: string): string {
  if (!ano) return "";
  const label = MONTH_OPTIONS.find((m) => m.value === mes)?.label;
  return label ? `${label}/${ano}` : ano;
}

/** Formata um período pra exibição — ex: "Mar/2021 – Atual", "2019 – 2022". */
export function formatPeriod(p: ResumePeriod): string {
  const start = formatMonthYear(p.inicioMes, p.inicioAno);
  const end = p.atual ? "Atual" : formatMonthYear(p.fimMes, p.fimAno);
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

/**
 * @react-pdf/renderer não suporta `overflow-wrap`/`word-break` — uma
 * "palavra" sem espaço (URL do LinkedIn, e-mail longo) simplesmente vaza
 * pra fora da largura do container em vez de quebrar linha, o que na coluna
 * lateral dos templates de duas colunas invade visualmente a coluna
 * principal. Insere espaços de largura zero (invisíveis) depois de
 * separadores comuns de URL, dando pontos de quebra ao motor de texto sem
 * alterar o conteúdo exibido.
 */
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

export function breakableText(text: string): string {
  return text.replace(/([/.\-_@])/g, `$1${ZERO_WIDTH_SPACE}`);
}

export interface ResumeExperience {
  cargo: string;
  empresa: string;
  periodo: ResumePeriod;
  descricao: string;
}

export interface ResumeEducation {
  curso: string;
  instituicao: string;
  periodo: ResumePeriod;
}

export interface ResumeData {
  nome: string;
  titulo: string;
  resumo: string;
  contato: ResumeContact;
  experiencias: ResumeExperience[];
  formacao: ResumeEducation[];
  habilidades: string[];
  idiomas: string[];
}

export const emptyResumeData: ResumeData = {
  nome: "",
  titulo: "",
  resumo: "",
  contato: { email: "", telefone: "", linkedin: "" },
  experiencias: [],
  formacao: [],
  habilidades: [],
  idiomas: [],
};

export type ResumeTemplateSlug = "basico" | "moderno" | "executivo" | "criativo" | "elegante";

export interface ResumeTemplateMeta {
  slug: ResumeTemplateSlug;
  name: string;
  description: string;
  /** Grátis só tem acesso ao "basico" — os outros 3 exigem Impulso/Mentoria. */
  paidOnly: boolean;
}

export const RESUME_TEMPLATES: ResumeTemplateMeta[] = [
  {
    slug: "basico",
    name: "Básico",
    description: "Uma coluna, direto ao ponto — o clássico currículo tradicional.",
    paidOnly: false,
  },
  {
    slug: "moderno",
    name: "Moderno",
    description: "Coluna lateral com contato e habilidades em destaque.",
    paidOnly: true,
  },
  {
    slug: "executivo",
    name: "Executivo",
    description: "Uma coluna, denso e sóbrio — o formato mais formal, ideal pra cargos sênior.",
    paidOnly: true,
  },
  {
    slug: "criativo",
    name: "Criativo",
    description: "Faixa de destaque colorida e rótulos de seção diferenciados.",
    paidOnly: true,
  },
  {
    slug: "elegante",
    name: "Elegante",
    description: "Coluna lateral à direita, traços finos e tipografia refinada.",
    paidOnly: true,
  },
];

export function getResumeTemplate(slug: string): ResumeTemplateMeta {
  return RESUME_TEMPLATES.find((t) => t.slug === slug) ?? RESUME_TEMPLATES[0];
}

/** Garante que o slug escolhido é válido para o plano — nunca confia no client. */
export function resolveAllowedTemplate(
  requestedSlug: string | undefined,
  isPaid: boolean
): ResumeTemplateSlug {
  if (!isPaid) return "basico";
  const meta = RESUME_TEMPLATES.find((t) => t.slug === requestedSlug);
  return meta ? meta.slug : "basico";
}

/**
 * Tolera dados legados: `periodo` já foi texto livre (ex: "4 anos") antes
 * desta versão do schema. Se não vier no formato novo (objeto), volta pro
 * período vazio em vez de tentar adivinhar mês/ano a partir do texto antigo.
 */
function normalizePeriod(raw: unknown): ResumePeriod {
  if (!raw || typeof raw !== "object") return { ...emptyPeriod };
  const r = raw as Partial<ResumePeriod>;
  return {
    inicioMes: typeof r.inicioMes === "string" ? r.inicioMes : "",
    inicioAno: typeof r.inicioAno === "string" ? r.inicioAno : "",
    fimMes: typeof r.fimMes === "string" ? r.fimMes : "",
    fimAno: typeof r.fimAno === "string" ? r.fimAno : "",
    atual: typeof r.atual === "boolean" ? r.atual : false,
  };
}

/**
 * Normaliza o que a IA devolve pro shape de `ResumeData`, tolerando campos
 * ausentes (a IA às vezes omite um array vazio em vez de retornar `[]`).
 */
export function normalizeResumeData(raw: unknown): ResumeData {
  const r = (raw ?? {}) as Partial<ResumeData> & { contato?: Partial<ResumeContact> };
  return {
    nome: typeof r.nome === "string" ? r.nome : "",
    titulo: typeof r.titulo === "string" ? r.titulo : "",
    resumo: typeof r.resumo === "string" ? r.resumo : "",
    contato: {
      email: typeof r.contato?.email === "string" ? r.contato.email : "",
      telefone: typeof r.contato?.telefone === "string" ? r.contato.telefone : "",
      linkedin: typeof r.contato?.linkedin === "string" ? r.contato.linkedin : "",
    },
    experiencias: Array.isArray(r.experiencias)
      ? r.experiencias.map((e) => ({
          cargo: typeof e?.cargo === "string" ? e.cargo : "",
          empresa: typeof e?.empresa === "string" ? e.empresa : "",
          periodo: normalizePeriod(e?.periodo),
          descricao: typeof e?.descricao === "string" ? e.descricao : "",
        }))
      : [],
    formacao: Array.isArray(r.formacao)
      ? r.formacao.map((f) => ({
          curso: typeof f?.curso === "string" ? f.curso : "",
          instituicao: typeof f?.instituicao === "string" ? f.instituicao : "",
          periodo: normalizePeriod(f?.periodo),
        }))
      : [],
    habilidades: Array.isArray(r.habilidades)
      ? r.habilidades.filter((h): h is string => typeof h === "string")
      : [],
    idiomas: Array.isArray(r.idiomas)
      ? r.idiomas.filter((h): h is string => typeof h === "string")
      : [],
  };
}

/**
 * A IA às vezes devolve o JSON envolto em ```json fences apesar da
 * instrução no prompt — tenta o parse direto primeiro, e só then limpa o
 * texto como fallback.
 */
export function parseResumeJson(content: string): ResumeData {
  try {
    return normalizeResumeData(JSON.parse(content));
  } catch {
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    return normalizeResumeData(JSON.parse(cleaned));
  }
}
