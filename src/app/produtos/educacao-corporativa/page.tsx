import type { Metadata } from "next";
import { Target, Route, BarChart3, Users } from "lucide-react";
import { ProductPageTemplate } from "@/components/sections/product-page-template";
import { FoldStepIndicator } from "@/components/brand/fold-step-indicator";

export const metadata: Metadata = {
  title: "Educação Corporativa — Ryze",
  description: "Trilhas de aprendizagem personalizadas por IA, desenhadas a partir dos gaps reais de cada colaborador.",
};

export default function EducacaoCorporativaPage() {
  return (
    <ProductPageTemplate
      eyebrow="Produtos de IA"
      title="Educação Corporativa"
      subtitle="Trilhas de aprendizagem personalizadas por IA — desenhadas a partir dos gaps reais de cada colaborador."
      demoLabel="Ryze IA · Trilha personalizada"
      demoTitle="Trilha gerada para Analista de Marketing Sênior"
      demoContent={
        <FoldStepIndicator
          currentStep={2}
          steps={[
            { label: "Diagnóstico", description: "Gaps identificados por IA" },
            { label: "Storytelling de dados", description: "Módulo 1" },
            { label: "Growth analítico", description: "Módulo 2" },
            { label: "Certificação", description: "Avaliação final" },
          ]}
        />
      }
      featuresTitle="O que a IA faz por você"
      features={[
        {
          icon: Target,
          title: "Diagnóstico automático de gaps",
          description: "Identifica lacunas de competência a partir de dados de performance e feedback.",
        },
        {
          icon: Route,
          title: "Trilha personalizada",
          description: "Monta um caminho de aprendizagem único para cada colaborador, não um curso genérico.",
        },
        {
          icon: BarChart3,
          title: "Medição de impacto",
          description: "Acompanha a evolução e conecta o aprendizado a indicadores reais de negócio.",
        },
        {
          icon: Users,
          title: "Escala sem perder personalização",
          description: "Centenas de trilhas individuais, geridas com o esforço de administrar uma só.",
        },
      ]}
      ctaTitle="Quer escalar o desenvolvimento do seu time?"
      ctaSubtitle="Veja uma demonstração ao vivo com um consultor."
      ctaHref="/contato"
    />
  );
}
