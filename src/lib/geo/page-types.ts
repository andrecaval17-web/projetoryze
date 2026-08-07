import type { GeoCity } from "./cities";
import type { ResultStat } from "@/components/sections/results-band";

export type GeoPageTypeSlug =
  | "curriculo-gratis"
  | "recolocacao-profissional"
  | "vagas-de-emprego"
  | "mentoria-de-carreira"
  | "recrutamento-e-selecao"
  | "consultoria-de-rh"
  | "treinamento-e-desenvolvimento"
  | "cultura-organizacional"
  | "cargos-e-salarios";

export type GeoAudience = "b2c" | "b2b";

/**
 * "prototype": só pré-renderado pra Vitória/ES (generateStaticParams) e de
 * fora do sitemap — é assim que um tipo novo entra em revisão sem já virar
 * lote completo. "batch": pré-renderado pra todas as cidades ativas em
 * `geo_cities` e presente no sitemap — vira isso só depois de aprovado
 * explicitamente (ver histórico: os 4 tipos B2C ficaram "prototype" de
 * propósito; os 4 primeiros B2B viraram "batch" após aprovação em
 * 2026-08-07).
 */
export type GeoBatchStatus = "prototype" | "batch";

export interface GeoPageType {
  slug: GeoPageTypeSlug;
  /** "b2c" (candidato, self-service) ou "b2b" (empresa, venda consultiva) — controla a malha "outros serviços nesta cidade": nunca cruza os dois públicos na mesma lista. */
  audience: GeoAudience;
  status: GeoBatchStatus;
  /** Nome completo do serviço — usado no H1, title e nas listas de links da malha. */
  label: string;
  /** Versão curta pros links "em outras cidades" (evita títulos gigantes na malha). */
  shortLabel: string;
  eyebrow: string;
  ctaHref: string;
  ctaLabel: string;
  /**
   * Tipo de dado estruturado (Service, não LocalBusiness): a Ryze não tem
   * endereço físico em cada cidade — declarar LocalBusiness por município
   * seria dado estruturado enganoso (spam de local pack). Service com
   * `areaServed` é o jeito correto de sinalizar cobertura geográfica sem
   * implicar presença física.
   */
  serviceType: string;
  buildTitle: (city: GeoCity) => string;
  buildDescription: (city: GeoCity) => string;
  buildH1: (city: GeoCity) => string;
  buildIntro: (city: GeoCity) => string;
  buildBenefits: (city: GeoCity) => string[];
  buildWhatsappMessage: (city: GeoCity) => string;
  /** Estatísticas de mercado citadas (nunca métrica inventada) — só as páginas B2B trazem essa seção, espelhando o mesmo dado já publicado em /consultoria/*. */
  results?: ResultStat[];
}

function ufUpper(city: GeoCity): string {
  return city.uf.toUpperCase();
}

export const GEO_PAGE_TYPES: GeoPageType[] = [
  // --- B2C (candidato) — protótipo pausado nesta fase, não avançar pro lote completo ---
  {
    slug: "curriculo-gratis",
    audience: "b2c",
    status: "prototype",
    label: "Currículo Grátis com IA",
    shortLabel: "Currículo com IA",
    eyebrow: "Currículo com IA · grátis",
    ctaHref: "/cadastro?plano=gratis",
    ctaLabel: "Criar meu currículo grátis",
    serviceType: "Elaboração de currículo com inteligência artificial",
    buildTitle: (city) => `Currículo Grátis com IA em ${city.name} (${ufUpper(city)}) — Ryze`,
    buildDescription: (city) =>
      `Monte seu currículo profissional com inteligência artificial gratuitamente, direto de ${city.name}. Sem cartão de crédito — comece agora com a Ryze.`,
    buildH1: (city) => `Currículo grátis com IA em ${city.name}, ${ufUpper(city)}`,
    buildIntro: (city) =>
      `Candidatos em ${city.name} já estão usando a Ryze para montar currículos profissionais em minutos, com ajuda de inteligência artificial — de graça, sem pegadinha.`,
    buildBenefits: (city) => [
      "Currículo pronto em poucos minutos, direto do navegador",
      "IA sugere como descrever suas experiências de forma profissional",
      `Download em PDF, pronto para enviar para vagas em ${city.name} ou em qualquer lugar`,
      "Sem cartão de crédito e sem custo",
    ],
    buildWhatsappMessage: (city) =>
      `Olá! Vi a página de currículo grátis com IA da Ryze para ${city.name} e quero saber mais.`,
  },
  {
    slug: "recolocacao-profissional",
    audience: "b2c",
    status: "prototype",
    label: "Recolocação Profissional",
    shortLabel: "Recolocação Profissional",
    eyebrow: "Recolocação de carreira",
    ctaHref: "/para-candidatos",
    ctaLabel: "Conhecer os planos de recolocação",
    serviceType: "Consultoria de recolocação profissional",
    buildTitle: (city) => `Recolocação Profissional em ${city.name} (${ufUpper(city)}) — Ryze`,
    buildDescription: (city) =>
      `Apoio completo para sua recolocação no mercado de trabalho em ${city.name}: currículo com IA, análise de LinkedIn, simulação de entrevista e mentoria de carreira.`,
    buildH1: (city) => `Recolocação profissional em ${city.name}, ${ufUpper(city)}`,
    buildIntro: (city) =>
      `Perdeu o emprego ou está buscando a próxima oportunidade em ${city.name}? A Ryze reúne num só lugar as ferramentas de IA e o apoio humano que aceleram sua recolocação.`,
    buildBenefits: () => [
      "Currículo com IA e análise de LinkedIn para se destacar",
      "Simulação de entrevista por voz com IA, quantas vezes precisar",
      "Sessão mensal com um consultor de recolocação de verdade",
      "Acompanhamento até você conquistar a próxima vaga",
    ],
    buildWhatsappMessage: (city) =>
      `Olá! Vi a página de recolocação profissional da Ryze para ${city.name} e quero saber mais.`,
  },
  {
    slug: "vagas-de-emprego",
    audience: "b2c",
    status: "prototype",
    label: "Vagas de Emprego",
    shortLabel: "Vagas de Emprego",
    eyebrow: "Vagas de emprego",
    ctaHref: "/vagas",
    ctaLabel: "Ver vagas abertas",
    serviceType: "Divulgação e intermediação de vagas de emprego",
    buildTitle: (city) => `Vagas de Emprego em ${city.name} (${ufUpper(city)}) — Ryze`,
    buildDescription: (city) =>
      `Vagas de emprego para quem está em ${city.name}, com candidatura direta e apoio de IA para se destacar. Grupo de WhatsApp com vagas novas todos os dias.`,
    buildH1: (city) => `Vagas de emprego em ${city.name}, ${ufUpper(city)}`,
    buildIntro: (city) =>
      `A Ryze publica vagas abertas com candidatura direta pelo site, e mantém um grupo de WhatsApp com novas oportunidades todos os dias — inclusive para quem está em ${city.name}.`,
    buildBenefits: () => [
      "Candidatura direta pelo site, sem burocracia",
      "Grupo de WhatsApp com vagas novas todos os dias",
      "Currículo com IA grátis para se candidatar em minutos",
      "Vagas de diferentes áreas e níveis de experiência",
    ],
    buildWhatsappMessage: (city) =>
      `Olá! Vi a página de vagas de emprego da Ryze para ${city.name} e quero entrar no grupo de vagas.`,
  },
  {
    slug: "mentoria-de-carreira",
    audience: "b2c",
    status: "prototype",
    label: "Mentoria de Carreira",
    shortLabel: "Mentoria de Carreira",
    eyebrow: "Mentoria de carreira",
    ctaHref: "/cadastro?plano=mentoria",
    ctaLabel: "Quero a Mentoria",
    serviceType: "Mentoria de carreira",
    buildTitle: (city) => `Mentoria de Carreira em ${city.name} (${ufUpper(city)}) — Ryze`,
    buildDescription: (city) =>
      `Sessões de mentoria de carreira 100% online para quem está em ${city.name}, com um consultor de recolocação de verdade te ajudando a chegar na próxima vaga.`,
    buildH1: (city) => `Mentoria de carreira em ${city.name}, ${ufUpper(city)}`,
    buildIntro: (city) =>
      `Um especialista de recolocação, não um algoritmo: a Mentoria da Ryze é 100% online e atende quem está em ${city.name} com a mesma qualidade de um atendimento presencial.`,
    buildBenefits: () => [
      "1 sessão mensal individual com um consultor de recolocação",
      "Simulação de entrevista ao vivo, com feedback real",
      "Apoio para transição de carreira ou primeiro emprego",
      "Tudo o que os planos Grátis e Impulso já oferecem",
    ],
    buildWhatsappMessage: (city) =>
      `Olá! Vi a página de mentoria de carreira da Ryze para ${city.name} e quero saber mais.`,
  },

  // --- B2B (empresa) — CTA sempre /contato, venda consultiva ---
  {
    slug: "recrutamento-e-selecao",
    audience: "b2b",
    status: "batch",
    label: "Recrutamento e Seleção",
    shortLabel: "Recrutamento e Seleção",
    eyebrow: "Recrutamento e Seleção",
    ctaHref: "/contato",
    ctaLabel: "Falar com um especialista",
    serviceType: "Recrutamento e seleção de pessoal",
    buildTitle: (city) => `Recrutamento e Seleção em ${city.name} (${ufUpper(city)}) — Ryze`,
    buildDescription: (city) =>
      `Recrutadores sêniores e tecnologia no processo para empresas em ${city.name} contratarem certo, mais rápido — finalistas qualificados em até 15 dias.`,
    buildH1: (city) => `Recrutamento e Seleção em ${city.name}, ${ufUpper(city)}`,
    buildIntro: (city) =>
      `Empresas em ${city.name} usam a consultoria de recrutamento da Ryze para reduzir o tempo de contratação sem abrir mão de assertividade — de vagas operacionais a posições estratégicas.`,
    buildBenefits: () => [
      "Recrutadores com +10 anos de experiência conduzindo o processo",
      "Sourcing e triagem acelerados por IA",
      "Finalistas qualificados em até 15 dias",
      "Do operacional ao estratégico, com critério objetivo e sem viés",
    ],
    buildWhatsappMessage: (city) =>
      `Olá! Vi a página de Recrutamento e Seleção da Ryze para empresas em ${city.name} e quero falar com um especialista.`,
    results: [
      { value: "~40%", label: "de redução no tempo de contratação com IA no processo de recrutamento", source: "impress.ai / benchmarks de mercado" },
      { value: "2,5x", label: "mais previsibilidade de desempenho com entrevistas estruturadas vs. não estruturadas", source: "SHRM" },
      { value: "até 30%", label: "do salário anual é o custo de uma contratação errada", source: "U.S. Department of Labor" },
    ],
  },
  {
    slug: "consultoria-de-rh",
    audience: "b2b",
    status: "batch",
    label: "Consultoria de RH",
    shortLabel: "Consultoria de RH",
    eyebrow: "Consultoria em RH",
    ctaHref: "/contato",
    ctaLabel: "Falar com um especialista",
    serviceType: "Consultoria em recursos humanos",
    buildTitle: (city) => `Consultoria de RH em ${city.name} (${ufUpper(city)}) — Ryze`,
    buildDescription: (city) =>
      `RH estratégico para empresas em ${city.name}: recrutamento, cultura, remuneração e treinamento com metodologia e resultado medido.`,
    buildH1: (city) => `Consultoria de RH em ${city.name}, ${ufUpper(city)}`,
    buildIntro: (city) =>
      `A Ryze atua nas frentes que mais impactam o negócio de empresas em ${city.name}: quem você contrata, a cultura que retém, o que você paga e como desenvolve as pessoas.`,
    buildBenefits: () => [
      "Recrutamento e seleção com recrutadores sêniores e IA",
      "Cultura organizacional desenhada, comunicada e medida",
      "Remuneração estratégica que reduz custo e retém talento",
      "Treinamento e desenvolvimento com impacto medido",
    ],
    buildWhatsappMessage: (city) =>
      `Olá! Vi a página de Consultoria de RH da Ryze para empresas em ${city.name} e quero falar com um especialista.`,
    results: [
      { value: "23%", label: "mais lucratividade em empresas com times engajados", source: "Gallup" },
      { value: "2,5x", label: "mais previsibilidade de contratação com seleção estruturada", source: "SHRM" },
      { value: "30%", label: "menos rotatividade com transparência salarial", source: "Payscale / HBR" },
    ],
  },
  {
    slug: "treinamento-e-desenvolvimento",
    audience: "b2b",
    status: "batch",
    label: "Treinamento e Desenvolvimento Corporativo",
    shortLabel: "Treinamento e Desenvolvimento",
    eyebrow: "Treinamento e Desenvolvimento",
    ctaHref: "/contato",
    ctaLabel: "Falar com um especialista",
    serviceType: "Treinamento e desenvolvimento corporativo",
    buildTitle: (city) => `Treinamento e Desenvolvimento Corporativo em ${city.name} (${ufUpper(city)}) — Ryze`,
    buildDescription: (city) =>
      `Programas de capacitação sob medida para empresas em ${city.name}, desenhados a partir de gaps reais e medidos por impacto no negócio.`,
    buildH1: (city) => `Treinamento e Desenvolvimento Corporativo em ${city.name}, ${ufUpper(city)}`,
    buildIntro: (city) =>
      `Empresas em ${city.name} usam a Ryze para desenvolver seus times com trilhas sob medida — não cursos genéricos — e IA para escalar a personalização.`,
    buildBenefits: () => [
      "Diagnóstico de gaps reais de competência por área",
      "Trilhas personalizadas, com IA para escalar sem perder qualidade",
      "Do operacional à formação de líderes e sucessão",
      "Impacto medido em indicadores de negócio, não só satisfação",
    ],
    buildWhatsappMessage: (city) =>
      `Olá! Vi a página de Treinamento e Desenvolvimento Corporativo da Ryze para empresas em ${city.name} e quero falar com um especialista.`,
    results: [
      { value: "94%", label: "dos profissionais ficariam mais tempo em empresas que investem no seu desenvolvimento", source: "LinkedIn Learning" },
      { value: "93%", label: "das empresas apontam aprendizado como principal solução de retenção", source: "LinkedIn Learning" },
      { value: "+20%", label: "mais chance de permanência após uma promoção interna (em 2 anos)", source: "LinkedIn Learning" },
    ],
  },
  {
    slug: "cultura-organizacional",
    audience: "b2b",
    status: "batch",
    label: "Cultura Organizacional & Engajamento",
    shortLabel: "Cultura Organizacional",
    eyebrow: "Cultura Organizacional",
    ctaHref: "/contato",
    ctaLabel: "Falar com um especialista",
    serviceType: "Consultoria de cultura organizacional e engajamento",
    buildTitle: (city) => `Cultura Organizacional e Engajamento em ${city.name} (${ufUpper(city)}) — Ryze`,
    buildDescription: (city) =>
      `Diagnóstico, desenho e mensuração de cultura organizacional para empresas em ${city.name} — cultura de verdade, não pesquisa de clima.`,
    buildH1: (city) => `Cultura Organizacional e Engajamento em ${city.name}, ${ufUpper(city)}`,
    buildIntro: (city) =>
      `Clima é a temperatura do momento; cultura é o que sustenta o time ao longo do tempo. A Ryze desenha, comunica e mede a cultura de empresas em ${city.name}.`,
    buildBenefits: () => [
      "Desenho de cultura para quem ainda não tem uma definida",
      "Comunicação para disseminar a cultura por todo o time",
      "Pesquisa periódica de percepção real, não só clima",
      "Liderança alinhada aos comportamentos que sustentam a cultura",
    ],
    buildWhatsappMessage: (city) =>
      `Olá! Vi a página de Cultura Organizacional e Engajamento da Ryze para empresas em ${city.name} e quero falar com um especialista.`,
    results: [
      { value: "23%", label: "mais lucratividade em unidades de negócio com times engajados", source: "Gallup" },
      { value: "18%", label: "mais produtividade em times altamente engajados", source: "Gallup" },
      { value: "78%", label: "menos absenteísmo em ambientes de alto engajamento", source: "Gallup" },
    ],
  },
  // 5º tipo B2B — protótipo aprovado em 2026-08-07, já em "batch". Copy
  // adaptada de /consultoria/cargos-e-salarios/page.tsx (mesmos
  // diferenciais e fontes citadas), não inventada do zero.
  {
    slug: "cargos-e-salarios",
    audience: "b2b",
    status: "batch",
    label: "Cargos e Salários & Remuneração Estratégica",
    shortLabel: "Cargos e Salários",
    eyebrow: "Cargos e Salários · Remuneração Estratégica",
    ctaHref: "/contato",
    ctaLabel: "Falar com um especialista",
    serviceType: "Consultoria de cargos, salários e remuneração estratégica",
    buildTitle: (city) =>
      `Cargos e Salários e Remuneração Estratégica em ${city.name} (${ufUpper(city)}) — Ryze`,
    buildDescription: (city) =>
      `Estruturação de cargos, salários e remuneração estratégica para empresas em ${city.name}: menos despesa, mais atração de talentos e menos turnover passivo.`,
    buildH1: (city) => `Cargos e Salários e Remuneração Estratégica em ${city.name}, ${ufUpper(city)}`,
    buildIntro: (city) =>
      `Empresas em ${city.name} usam a Ryze para estruturar cargos e salários com uma lente de remuneração estratégica — reduzindo despesa, atraindo os melhores profissionais e contendo o turnover passivo.`,
    buildBenefits: () => [
      "Estudos de teses de remuneração (fixo, variável, benefícios)",
      "Redução de despesas sem perder competitividade",
      "Pacotes atrativos para os melhores profissionais do mercado",
      "Trilhas de carreira e progressão claras para o time",
    ],
    buildWhatsappMessage: (city) =>
      `Olá! Vi a página de Cargos e Salários e Remuneração Estratégica da Ryze para empresas em ${city.name} e quero falar com um especialista.`,
    results: [
      { value: "até 50%", label: "menos rotatividade em empresas com estratégia de remuneração definida", source: "Compport / benchmarks de mercado" },
      { value: "<8%", label: "de turnover voluntário com pagamento acima da média (vs. >15% abaixo da média)", source: "Staffing by Starboard" },
      { value: "até 33%", label: "do salário anual é o custo de repor um colaborador que pede demissão", source: "SHRM / NetSuite" },
    ],
  },
];

export function getGeoPageType(slug: string): GeoPageType | undefined {
  return GEO_PAGE_TYPES.find((t) => t.slug === slug);
}
