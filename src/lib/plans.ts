export type CandidatePlanSlug = "gratis" | "impulso" | "mentoria";

export interface CandidatePlan {
  slug: CandidatePlanSlug;
  name: string;
  /** Display price, e.g. "R$ 0" or "R$ 19,90". */
  price: string;
  /** Amount in cents — source of truth for Stripe (Fase 3 checkout). */
  priceCents: number;
  period?: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  recommended?: boolean;
  /** Emphasis badge text for the pushed plan. */
  badgeLabel?: string;
  /** Per-day / value reframing shown under the price. */
  valueNote?: string;
  footnote?: string;
  /** Name of the env var holding the Stripe Price ID (paid plans only). */
  stripePriceEnv?: string;
}

/**
 * Single source of truth for the candidate funnel. The plans page renders
 * these, and the future Stripe checkout will look up `stripePriceEnv` to
 * start a subscription. Prices set deliberately low to maximize top-of-funnel
 * conversion (see the commercial strategy).
 */
export const candidatePlans: CandidatePlan[] = [
  {
    slug: "gratis",
    name: "Grátis",
    price: "R$ 0",
    priceCents: 0,
    tagline: "Comece sua busca com o pé direito, sem gastar nada.",
    features: [
      "Currículo profissional criado com IA",
      "Entrada no grupo de WhatsApp com vagas diárias",
    ],
    ctaLabel: "Criar currículo grátis",
    footnote: "Sem cartão de crédito.",
  },
  {
    slug: "impulso",
    name: "Impulso",
    price: "R$ 19,90",
    priceCents: 1990,
    period: "/mês",
    tagline: "As ferramentas de IA para se candidatar melhor — sozinho.",
    features: [
      "Tudo do plano Grátis",
      "IA adapta seu currículo para cada vaga",
      "Análise do seu LinkedIn com sugestões de melhoria",
      "Simulador de entrevista com IA",
    ],
    ctaLabel: "Assinar Impulso",
    stripePriceEnv: "NEXT_PUBLIC_STRIPE_PRICE_IMPULSO",
  },
  {
    slug: "mentoria",
    name: "Mentoria",
    price: "R$ 49,90",
    priceCents: 4990,
    period: "/mês",
    tagline: "Tudo do Impulso + um especialista de verdade te guiando até a recolocação.",
    features: [
      "Tudo do plano Impulso",
      "1 sessão mensal com consultor de recolocação",
      "Mentoria de carreira e simulação de entrevista ao vivo",
      "Apoio para primeiro emprego ou transição de carreira",
    ],
    ctaLabel: "Quero a Mentoria",
    recommended: true,
    badgeLabel: "Mais escolhido",
    valueNote: "menos de R$ 1,70 por dia",
    footnote: "Vagas de mentoria limitadas por mês.",
    stripePriceEnv: "NEXT_PUBLIC_STRIPE_PRICE_MENTORIA",
  },
];

export function getPlan(slug: string): CandidatePlan | undefined {
  return candidatePlans.find((p) => p.slug === slug);
}
