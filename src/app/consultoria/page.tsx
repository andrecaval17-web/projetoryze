import type { Metadata } from "next";
import Link from "next/link";
import { Search, Users2, LineChart, GraduationCap } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ResultsBand } from "@/components/sections/results-band";
import { CtaBand } from "@/components/sections/cta-band";
import { ServiceCard } from "@/components/ui/service-card";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Consultoria em Recursos Humanos — Ryze",
  description:
    "Recrutamento e seleção, cultura organizacional, cargos e salários e treinamento e desenvolvimento — consultoria de RH com metodologia e resultado.",
  path: "/consultoria",
});

const services = [
  {
    icon: Search,
    title: "Recrutamento e Seleção",
    description: "Recrutadores sêniores e tecnologia no processo para trazer os candidatos certos, mais rápido que o mercado.",
    highlight: "Finalistas em até 15 dias",
    bullets: [
      "Recrutadores com +10 anos de experiência",
      "De vagas operacionais a estratégicas",
      "Alta taxa de assertividade",
    ],
    href: "/consultoria/recrutamento-e-selecao",
  },
  {
    icon: Users2,
    title: "Cultura Organizacional",
    description: "A maioria das empresas mede clima, não cultura. Nós desenhamos, comunicamos e medimos a cultura de verdade.",
    highlight: "Clima ≠ cultura",
    bullets: [
      "Desenho de cultura para quem não tem",
      "Comunicação para quem tem mas não dissemina",
      "Pesquisa periódica de percepção real",
    ],
    href: "/consultoria/cultura-organizacional",
  },
  {
    icon: LineChart,
    title: "Remuneração Estratégica",
    description: "Muito além de cargos e salários: teses de remuneração que reduzem despesa, atraem os melhores e seguram quem importa.",
    highlight: "Menos custo, menos turnover",
    bullets: [
      "Estudos de teses de remuneração",
      "Redução do turnover passivo",
      "Atratividade para os melhores talentos",
    ],
    href: "/consultoria/cargos-e-salarios",
  },
  {
    icon: GraduationCap,
    title: "Treinamento e Desenvolvimento",
    description: "Trilhas sob medida a partir dos gaps reais do time, com IA e impacto medido em indicadores de negócio.",
    highlight: "94% ficam mais tempo",
    bullets: [
      "Diagnóstico de gaps reais",
      "Personalização em escala com IA",
      "Impacto medido no negócio",
    ],
    href: "/consultoria/treinamento-e-desenvolvimento",
  },
];

export default function ConsultoriaPage() {
  return (
    <>
      <PageHero
        eyebrow="Consultoria em RH"
        title="RH estratégico, com metodologia e resultado"
        subtitle="Atuamos nas frentes que mais impactam o negócio: quem você contrata, a cultura que retém, o que você paga e como desenvolve as pessoas."
      >
        <Button asChild size="lg">
          <Link href="/contato">Falar com um especialista</Link>
        </Button>
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.href} {...service} />
          ))}
        </div>
      </section>

      <ResultsBand
        title="Por que RH bem estruturado vira resultado"
        subtitle="Os números que sustentam cada frente da nossa consultoria — de fontes de mercado, não de promessas."
        stats={[
          {
            value: "23%",
            label: "mais lucratividade em empresas com times engajados",
            source: "Gallup",
          },
          {
            value: "2,5x",
            label: "mais previsibilidade de contratação com seleção estruturada",
            source: "SHRM",
          },
          {
            value: "30%",
            label: "menos rotatividade com transparência salarial",
            source: "Payscale / HBR",
          },
        ]}
      />

      <CtaBand
        title="Não sabe por onde começar?"
        subtitle="Fale com um especialista e descubra qual frente traz mais resultado para o seu momento."
        ctaLabel="Falar com um especialista"
        ctaHref="/contato"
        tone="dark"
      />
    </>
  );
}
