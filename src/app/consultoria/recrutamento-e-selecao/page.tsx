import type { Metadata } from "next";
import { Award, Cpu, Timer, Target, Layers, ShieldCheck } from "lucide-react";
import { ServicePageTemplate } from "@/components/sections/service-page-template";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Recrutamento e Seleção — Ryze Consultoria",
  description:
    "Recrutadores com mais de 10 anos de experiência e tecnologia no processo: candidatos finalistas em até 15 dias, de vagas operacionais a estratégicas.",
  path: "/consultoria/recrutamento-e-selecao",
});

export default function RecrutamentoESelecaoPage() {
  return (
    <ServicePageTemplate
      eyebrow="Recrutamento e Seleção"
      title="Os candidatos certos, mais rápido que o mercado"
      subtitle="Recrutadores sêniores e tecnologia no processo para entregar finalistas qualificados em até 15 dias — de vagas operacionais a posições estratégicas."
      highlights={[
        { value: "+10 anos", label: "de experiência dos nossos recrutadores" },
        { value: "até 15 dias", label: "para apresentar candidatos finalistas" },
        { value: "operacional → estratégica", label: "cobrimos todos os níveis de vaga" },
      ]}
      painTitle="Contratar devagar e errado custa caro"
      painPoints={[
        "Vagas abertas por meses sobrecarregam o time e travam entregas.",
        "Contratações por urgência que não passam do período de experiência.",
        "Processos lentos e desorganizados afastam os melhores candidatos — que têm outras ofertas.",
        "Falta de critério objetivo para avaliar fit técnico e cultural.",
      ]}
      differentiatorsTitle="Como a Ryze entrega mais rápido e com mais assertividade"
      differentiators={[
        {
          icon: Award,
          title: "Recrutadores com +10 anos de experiência",
          description:
            "Profissionais sêniores que já conduziram centenas de processos — sabem ler além do currículo e reconhecer o candidato certo.",
        },
        {
          icon: Cpu,
          title: "Tecnologia e IA no processo",
          description:
            "Sourcing e triagem acelerados por IA para varrer mais candidatos em menos tempo. Ferramentas de IA chegam a reduzir o tempo de contratação em cerca de 40%.",
        },
        {
          icon: Timer,
          title: "Finalistas em até 15 dias",
          description:
            "Um funil enxuto e bem conduzido: você recebe uma shortlist de finalistas qualificados em até 15 dias, não em meses.",
        },
        {
          icon: Target,
          title: "Alta taxa de assertividade",
          description:
            "Seleção estruturada e baseada em competências, acompanhada por indicadores — para reduzir a chance de uma contratação que não vinga.",
        },
        {
          icon: Layers,
          title: "Do operacional ao estratégico",
          description:
            "Da linha de frente a posições de liderança e especialistas difíceis de encontrar — ajustamos o método ao nível e à urgência da vaga.",
        },
        {
          icon: ShieldCheck,
          title: "Processo justo e sem viés",
          description:
            "Critérios objetivos e consistentes para todos os candidatos, reduzindo viés inconsciente na triagem e nas entrevistas.",
        },
      ]}
      methodologyTitle="Como conduzimos o processo seletivo"
      methodologySteps={[
        { label: "Alinhamento", description: "Perfil da vaga e critérios" },
        { label: "Sourcing + IA", description: "Busca ativa e triagem" },
        { label: "Entrevistas", description: "Técnica e cultural" },
        { label: "Shortlist", description: "Finalistas em até 15 dias" },
        { label: "Contratação", description: "Proposta e acompanhamento" },
      ]}
      resultsTitle="Por que método e tecnologia importam"
      resultsSubtitle="Dados de mercado sobre o impacto de selecionar com estrutura e agilidade — a base da nossa forma de trabalhar."
      results={[
        {
          value: "~40%",
          label: "de redução no tempo de contratação com IA no processo de recrutamento",
          source: "impress.ai / benchmarks de mercado",
        },
        {
          value: "2,5x",
          label: "mais previsibilidade de desempenho com entrevistas estruturadas vs. não estruturadas",
          source: "SHRM",
        },
        {
          value: "até 30%",
          label: "do salário anual é o custo de uma contratação errada",
          source: "U.S. Department of Labor",
        },
      ]}
      ctaLabel="Pronto para contratar melhor e mais rápido?"
      ctaSubtitle="Fale com um especialista e receba finalistas qualificados em até 15 dias."
      ctaHref="/contato"
    />
  );
}
