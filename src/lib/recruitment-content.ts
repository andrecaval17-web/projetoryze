import type { FoldStep } from "@/components/brand/fold-step-indicator";

/**
 * Conteúdo de Recrutamento e Seleção compartilhado entre a página nacional
 * (/consultoria/recrutamento-e-selecao) e as páginas geo do mesmo tipo
 * (/recrutamento-e-selecao/[uf]/[cidade]) — pra não divergir: qualquer
 * atualização de texto muda nos dois lugares de uma vez só, a partir deste
 * único módulo.
 */

export const CREDENTIALS_LINE =
  "Recrutadores com mais de 10 anos de experiência · Finalistas em até 15 dias · Reposição gratuita em 60 dias";

export const JOBS_CONDUCTED_TEXT =
  "Da área administrativa e financeira à operação e às vendas. Alguns exemplos recentes: Analista de RH Sênior, Analista Financeiro Pleno, Vendedor Interno, Operador de Expedição e Operador de Produção. A maioria das vagas foi fechada em menos de duas semanas.";

export const METHODOLOGY_TITLE = "Como conduzimos o processo seletivo";

export const METHODOLOGY_STEPS: FoldStep[] = [
  { label: "Alinhamento", description: "Perfil da vaga e critérios" },
  { label: "Sourcing + IA", description: "Busca ativa e triagem" },
  { label: "Entrevistas", description: "Técnica e cultural" },
  { label: "Shortlist", description: "Finalistas em até 15 dias" },
  { label: "Contratação", description: "Proposta e acompanhamento" },
];

// Versão mais enxuta (mesmo conteúdo) — substitui o texto anterior, mais
// longo, que repetia "nos primeiros 60 dias" duas vezes.
export const GUARANTEE_TEXT =
  "Se o profissional contratado sair nos primeiros 60 dias, fazemos a reposição sem custo, seja por pedido de demissão dele ou por desligamento pela empresa. Neste segundo caso, pedimos que o motivo seja justificado.";

export const RECRUITMENT_FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Em quanto tempo recebo os candidatos finalistas?",
    answer: "Em até 15 dias. A maioria das vagas que conduzimos foi fechada em menos de duas semanas.",
  },
  {
    question: "O que acontece se o profissional sair logo depois de contratado?",
    answer: "Se isso ocorrer nos primeiros 60 dias, a reposição é gratuita.",
  },
  {
    question: "Para quais tipos de vaga vocês atendem?",
    answer: "Para vagas administrativas, financeiras, comerciais, operacionais e de RH, em vários níveis.",
  },
  {
    question: "Quanto custa o serviço de recrutamento e seleção?",
    answer:
      "Cobramos um percentual sobre o salário da vaga. O percentual varia conforme o nível da posição e a quantidade de vagas abertas ao mesmo tempo. Depois de entender sua necessidade, enviamos a proposta.",
  },
  {
    question: "Vocês atendem empresas de fora do Espírito Santo?",
    answer: "Sim, atendemos empresas em todo o Brasil.",
  },
  {
    question: "Como começo?",
    answer: "Preencha o formulário desta página com o cargo que precisa contratar. Nosso time comercial entra em contato com você.",
  },
];

/** JSON-LD FAQPage a partir de RECRUITMENT_FAQ_ITEMS — montado uma vez aqui
 * (não duplicado) e importado tanto pela página nacional quanto pela geo. */
export const RECRUITMENT_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: RECRUITMENT_FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};
