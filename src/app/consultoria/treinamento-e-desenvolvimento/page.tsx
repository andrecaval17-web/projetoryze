import type { Metadata } from "next";
import { Target, Route, BarChart3, Users, Sparkles, Repeat } from "lucide-react";
import { ServicePageTemplate } from "@/components/sections/service-page-template";
import { buildPageMetadata } from "@/lib/seo";
import { buildContactWhatsappHref } from "@/lib/whatsapp-number";

export const metadata: Metadata = buildPageMetadata({
  title: "Treinamento e Desenvolvimento — Ryze Consultoria",
  description:
    "Programas de capacitação desenhados a partir de gaps reais e medidos por impacto no negócio — desenvolvimento que retém e performa.",
  path: "/consultoria/treinamento-e-desenvolvimento",
});

export default function TreinamentoEDesenvolvimentoPage() {
  return (
    <ServicePageTemplate
      eyebrow="Treinamento e Desenvolvimento"
      title="Desenvolvimento que retém e muda indicador"
      subtitle="Programas desenhados a partir de gaps reais de competência e medidos pelo impacto que geram — não por quantas pessoas participaram."
      highlights={[
        { value: "sob medida", label: "trilhas a partir dos gaps reais do time" },
        { value: "com IA", label: "personalização em escala, sem custo de escala" },
        { value: "com métrica", label: "impacto medido em indicadores de negócio" },
      ]}
      painTitle="Treinamento genérico não resolve gap específico"
      painPoints={[
        "Treinamentos padronizados que não conversam com a realidade do time.",
        "Baixo engajamento porque o conteúdo não parece relevante.",
        "Nenhuma métrica além de 'quantas pessoas participaram'.",
        "Desenvolvimento desconectado do plano estratégico da empresa.",
      ]}
      differentiatorsTitle="Como desenvolvemos com propósito"
      differentiators={[
        {
          icon: Target,
          title: "Diagnóstico de gaps reais",
          description:
            "Mapeamos as lacunas de competência por área a partir de dados de performance e feedback — o treino resolve o que realmente falta.",
        },
        {
          icon: Route,
          title: "Trilha personalizada",
          description:
            "Um caminho de aprendizagem sob medida para cada perfil, não um curso genérico igual para todos.",
        },
        {
          icon: Sparkles,
          title: "Escala com IA",
          description:
            "Personalização assistida por IA que entrega centenas de trilhas individuais com o esforço de administrar uma só.",
        },
        {
          icon: BarChart3,
          title: "Impacto medido",
          description:
            "Conectamos o aprendizado a indicadores reais de negócio — produtividade, qualidade, retenção — não só à pesquisa de satisfação.",
        },
        {
          icon: Users,
          title: "Do operacional à liderança",
          description:
            "Programas para todos os níveis, incluindo formação de líderes e sucessão — o desenvolvimento que sustenta o crescimento.",
        },
        {
          icon: Repeat,
          title: "Aprendizagem contínua",
          description:
            "Cultura de desenvolvimento que não termina no fim do curso — acompanhamento e evolução ao longo do tempo.",
        },
      ]}
      methodologyTitle="Como desenhamos o programa"
      methodologySteps={[
        { label: "Diagnóstico", description: "Mapeamento de gaps por área" },
        { label: "Desenho", description: "Trilha sob medida" },
        { label: "Execução", description: "Presencial, online e IA" },
        { label: "Mensuração", description: "Impacto em indicadores" },
      ]}
      resultsTitle="Por que desenvolver retém e performa"
      resultsSubtitle="O que os dados mostram sobre investir no desenvolvimento das pessoas — a lógica por trás dos nossos programas."
      results={[
        {
          value: "94%",
          label: "dos profissionais ficariam mais tempo em empresas que investem no seu desenvolvimento",
          source: "LinkedIn Learning",
        },
        {
          value: "93%",
          label: "das empresas se preocupam com retenção — e apontam aprendizado como principal solução",
          source: "LinkedIn Learning",
        },
        {
          value: "+20%",
          label: "mais chance de permanência após uma promoção interna (em 2 anos)",
          source: "LinkedIn Learning",
        },
      ]}
      ctaLabel="Quer desenvolver seu time com propósito?"
      ctaSubtitle="Fale com um especialista sobre o programa ideal para o seu time."
      ctaHref={buildContactWhatsappHref("Treinamento e Desenvolvimento")}
    />
  );
}
