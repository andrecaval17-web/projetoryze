import type { Metadata } from "next";
import { PiggyBank, Magnet, UserMinus, Scale, BarChart3, FileSearch } from "lucide-react";
import { ServicePageTemplate } from "@/components/sections/service-page-template";
import { buildPageMetadata } from "@/lib/seo";
import { buildContactWhatsappHref } from "@/lib/whatsapp-number";

export const metadata: Metadata = buildPageMetadata({
  title: "Cargos e Salários e Remuneração Estratégica — Ryze Consultoria",
  description:
    "Cargos e salários com metodologia de remuneração estratégica: estudos que reduzem despesas, atraem os melhores profissionais e contêm o turnover passivo.",
  path: "/consultoria/cargos-e-salarios",
});

export default function RemuneracaoEstrategicaPage() {
  return (
    <ServicePageTemplate
      eyebrow="Cargos e Salários · Remuneração Estratégica"
      title="Cargos e salários e remuneração estratégica: menos custo, mais retenção"
      subtitle="Estruturamos cargos e salários com uma lente de remuneração estratégica: reduzindo despesas, atraindo os melhores profissionais e contendo o turnover passivo — o colaborador que sai por conta própria."
      highlights={[
        { value: "menos despesa", label: "estrutura desenhada para eficiência de custo" },
        { value: "mais atração", label: "pacotes competitivos para os melhores talentos" },
        { value: "menos turnover", label: "retenção do time que você não quer perder" },
      ]}
      painTitle="Cargos e salários sem estratégia viram só despesa"
      painPoints={[
        "Negociações caso a caso que geram desigualdade interna e insatisfação.",
        "Folha pesada, mas sem clareza se o dinheiro está indo para onde retém e atrai.",
        "Bons profissionais pedindo demissão por propostas melhores — o turnover passivo que dói mais.",
        "Faixas salariais desatualizadas em relação ao mercado, sem plano de carreira claro.",
      ]}
      differentiatorsTitle="Como estruturamos cargos e salários com remuneração estratégica"
      differentiators={[
        {
          icon: FileSearch,
          title: "Estudos de teses de remuneração",
          description:
            "Analisamos cenários e modelos de remuneração (fixo, variável, benefícios) para encontrar a estrutura que faz mais sentido para a sua estratégia — e o seu orçamento.",
        },
        {
          icon: PiggyBank,
          title: "Redução de despesas",
          description:
            "Remuneração mal desenhada custa caro em folha e em turnover. Reorganizamos a estrutura para reduzir desperdício sem perder competitividade.",
        },
        {
          icon: Magnet,
          title: "Atratividade para os melhores",
          description:
            "Pacotes alinhados ao mercado que fazem o profissional certo escolher você. Empresas com remuneração alinhada a benchmarks têm 30% mais chance de atrair top talent.",
        },
        {
          icon: UserMinus,
          title: "Redução do turnover passivo",
          description:
            "O colaborador que pede as contas é o mais caro de repor. Estrutura justa e competitiva reduz drasticamente a saída voluntária de quem você quer manter.",
        },
        {
          icon: Scale,
          title: "Equidade e transparência",
          description:
            "Critérios claros de por que cada pessoa ganha o que ganha — reduzindo vieses e aumentando a confiança do time.",
        },
        {
          icon: BarChart3,
          title: "Trilhas de carreira e progressão",
          description:
            "Faixas e níveis que mostram ao colaborador para onde ele pode crescer — e o que precisa fazer para chegar lá.",
        },
      ]}
      methodologyTitle="Como estruturamos cargos e salários e remuneração"
      methodologySteps={[
        { label: "Diagnóstico", description: "Folha, cargos e cenário atual" },
        { label: "Benchmarking", description: "Pesquisa salarial de mercado" },
        { label: "Teses", description: "Modelos de remuneração e custo" },
        { label: "Estrutura", description: "Faixas e trilhas de carreira" },
        { label: "Implementação", description: "Comunicação e ajuste gradual" },
      ]}
      resultsTitle="O que uma remuneração estratégica gera"
      resultsSubtitle="Pesquisas sobre estratégia e competitividade de remuneração — o que orienta a nossa metodologia."
      results={[
        {
          value: "até 50%",
          label: "menos rotatividade em empresas com estratégia de remuneração definida",
          source: "Compport / benchmarks de mercado",
        },
        {
          value: "<8%",
          label: "de turnover voluntário com pagamento acima da média (vs. >15% abaixo da média)",
          source: "Staffing by Starboard",
        },
        {
          value: "até 33%",
          label: "do salário anual é o custo de repor um colaborador que pede demissão",
          source: "SHRM / NetSuite",
        },
      ]}
      ctaLabel="Quer remuneração que retém e cabe no orçamento?"
      ctaSubtitle="Fale com um especialista sobre um estudo de remuneração estratégica."
      ctaHref={buildContactWhatsappHref("Cargos e Salários e Remuneração Estratégica")}
    />
  );
}
