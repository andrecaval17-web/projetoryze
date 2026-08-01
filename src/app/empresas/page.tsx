import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search, Users2, LineChart, GraduationCap, Film } from "lucide-react";
import { DarkHero } from "@/components/sections/dark-hero";
import { ResultsBand } from "@/components/sections/results-band";
import { CtaBand } from "@/components/sections/cta-band";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FoldCorner } from "@/components/brand/fold-corner";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Para empresas — Ryze",
  description:
    "Consultoria estratégica e produtos de inteligência artificial que aceleram recrutamento, cultura e desenvolvimento do seu RH.",
  path: "/empresas",
});

const consultoriaItems = [
  { icon: Search, label: "Recrutamento e Seleção" },
  { icon: Users2, label: "Cultura Organizacional" },
  { icon: LineChart, label: "Remuneração Estratégica" },
  { icon: GraduationCap, label: "Treinamento e Desenvolvimento" },
];

const produtosItems = [
  { icon: GraduationCap, label: "Ryze Academy — educação corporativa com IA 24/7" },
  { icon: Film, label: "Cultura & Engajamento — escuta contínua e mentor de IA" },
];

// Conteúdo idêntico ao antigo Home (src/app/page.tsx) — só movido pra cá e
// sem a seção de isca pra candidatos, que já tem seu próprio destino
// dedicado agora (/para-candidatos, atrás da pergunta em /). Ver
// src/components/sections/audience-gate.tsx para o porquê da divisão.
export default function EmpresasPage() {
  return (
    <>
      <DarkHero
        eyebrow="IA aplicada a RH · para empresas"
        title={
          <>
            O RH da sua empresa, <span className="text-gradient-ryze">turbinado por IA</span>
          </>
        }
        subtitle="Consultoria estratégica e produtos de inteligência artificial que aceleram recrutamento, cultura e desenvolvimento — para o seu time contratar melhor e mais rápido."
        primaryCta={
          <Button asChild size="lg">
            <Link href="/contato">Falar com um especialista</Link>
          </Button>
        }
        stats={[
          { value: "87%", label: "do treinamento se perde em 30 dias sem reforço" },
          { value: "+56%", label: "de turnover no Brasil — o maior do mundo" },
          { value: "+12pp", label: "de engajamento em média, por líder Ryze" },
        ]}
      />

      {/* Chamariz B2B: as duas frentes para empresas */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="accent-soft" className="mb-4">
            Para empresas
          </Badge>
          <h2 className="font-display text-display-md font-semibold text-fg">
            Duas formas de trabalhar com a Ryze
          </h2>
          <p className="mt-3 text-body-lg text-fg-muted">
            Da metodologia humana da consultoria à velocidade dos nossos
            produtos de IA — escolha por onde acelerar o seu RH.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Consultoria */}
          <Card className="flex flex-col p-8">
            <Badge variant="dark" className="self-start">
              Consultoria
            </Badge>
            <h3 className="mt-4 font-display text-heading-lg font-semibold text-fg">
              RH estratégico, com metodologia e resultado
            </h3>
            <p className="mt-2 text-body-md text-fg-muted">
              Estruturamos as frentes que mais impactam o negócio — de quem você
              contrata à forma como desenvolve o time.
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {consultoriaItems.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-body-sm text-fg">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
            <Button asChild variant="secondary" className="mt-8 self-start">
              <Link href="/consultoria">
                Conhecer a consultoria
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>

          {/* Produtos de IA */}
          <Card className="relative flex flex-col overflow-hidden border-accent-500/40 p-8">
            <FoldCorner />
            <Badge variant="accent" className="self-start">
              Produtos de IA
            </Badge>
            <h3 className="mt-4 font-display text-heading-lg font-semibold text-fg">
              Tecnologia que acelera o seu RH
            </h3>
            <p className="mt-2 text-body-md text-fg-muted">
              Ferramentas de IA que fazem o trabalho pesado — para o seu time
              focar em decisão, não em planilha.
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {produtosItems.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-body-sm text-fg">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-ryze text-white shadow-glow-sm">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 self-start">
              <Link href="/produtos">
                Ver produtos de IA
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      <ResultsBand
        title="RH orientado a dados dá resultado"
        subtitle="Não é opinião — é o que a pesquisa de mercado mostra sobre fazer bem cada uma dessas frentes."
        stats={[
          {
            value: "23%",
            label: "mais lucratividade em empresas com times engajados",
            source: "Gallup",
          },
          {
            value: "2,5x",
            label: "mais previsibilidade de desempenho com seleção estruturada",
            source: "SHRM",
          },
          {
            value: "94%",
            label: "dos profissionais ficam mais tempo onde há investimento em desenvolvimento",
            source: "LinkedIn Learning",
          },
        ]}
      />

      <CtaBand
        title="Pronto para colocar a IA a favor do seu RH?"
        subtitle="Fale com um especialista e descubra o melhor caminho para a sua empresa."
        ctaLabel="Falar com um especialista"
        ctaHref="/contato"
        tone="dark"
      />
    </>
  );
}
