import type { Metadata } from "next";
import { Search, Sparkles, Target, ShieldCheck } from "lucide-react";
import { ProductPageTemplate } from "@/components/sections/product-page-template";
import { MatchRow } from "@/components/sections/ai-demo-panel";

export const metadata: Metadata = {
  title: "Recrutamento com IA — Ryze",
  description: "Hunting e análise automática de candidatos com inteligência artificial — do sourcing ao ranking por match.",
};

export default function RecrutamentoIaPage() {
  return (
    <ProductPageTemplate
      eyebrow="Produtos de IA"
      title="Recrutamento com IA"
      subtitle="Hunting e análise automática de candidatos — do sourcing ao ranking por match, em minutos."
      demoLabel="Ryze IA · Análise em tempo real"
      demoTitle="Analisando candidatos para Analista de Marketing Sênior"
      demoContent={
        <div className="flex flex-col divide-y divide-border">
          <MatchRow name="Camila Andrade" role="8 anos de experiência · Growth" match={96} />
          <MatchRow name="Rafael Nogueira" role="6 anos de experiência · Performance" match={91} />
          <MatchRow name="Beatriz Lima" role="5 anos de experiência · Conteúdo" match={84} />
          <MatchRow name="Thiago Souza" role="7 anos de experiência · Marca" match={78} />
        </div>
      }
      featuresTitle="O que a IA faz por você"
      features={[
        {
          icon: Search,
          title: "Hunting automático",
          description: "Busca candidatos ativos e passivos em múltiplas fontes, sem depender só de quem se candidata.",
        },
        {
          icon: Sparkles,
          title: "Análise automática de currículos",
          description: "Lê e estrutura currículos em segundos, extraindo experiência, formação e competências relevantes.",
        },
        {
          icon: Target,
          title: "Ranking por match",
          description: "Classifica candidatos por aderência real à vaga, não só por palavras-chave.",
        },
        {
          icon: ShieldCheck,
          title: "Redução de viés",
          description: "Critérios objetivos e consistentes, reduzindo viés inconsciente na triagem inicial.",
        },
      ]}
      ctaTitle="Quer recrutar com a velocidade da IA?"
      ctaSubtitle="Veja uma demonstração ao vivo com um consultor."
      ctaHref="/contato"
    />
  );
}
