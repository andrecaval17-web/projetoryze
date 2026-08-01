import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Film, type LucideIcon } from "lucide-react";
import { ProductsHero } from "@/components/sections/products-hero";
import { AiDemoPanel } from "@/components/sections/ai-demo-panel";
import { ServiceCard } from "@/components/ui/service-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Produtos Ryze — Ryze Academy e Ryze HR Cultura",
  description:
    "Dois produtos prontos: educação corporativa com IA que responde dúvidas 24/7, e gestão de cultura e engajamento com escuta contínua.",
  path: "/produtos",
});

/** One line of the hub's "IA em ação" demo — a real, sourced highlight per product, not a candidate-matching mock. */
function ProductActivityRow({
  icon: Icon,
  name,
  activity,
  stat,
}: {
  icon: LucideIcon;
  name: string;
  activity: string;
  stat: string;
}) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-400">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-medium text-fg">{name}</p>
        <p className="truncate text-caption text-fg-muted">{activity}</p>
      </div>
      <span className="shrink-0 text-body-sm font-semibold text-gradient-ryze">{stat}</span>
    </div>
  );
}

export default function ProdutosPage() {
  return (
    <>
      <ProductsHero
        eyebrow="Produtos Ryze"
        title={
          <>
            Dois produtos, <span className="text-gradient-ryze">dois problemas caros</span> resolvidos
          </>
        }
        subtitle="Conhecimento que se perde e gente que sai antes da hora — os dois custam caro e raramente aparecem juntos numa planilha. A Ryze construiu uma solução pronta pra cada um."
        primaryCta={
          <Button asChild size="lg">
            <Link href="/contato">Falar com um especialista</Link>
          </Button>
        }
        demo={
          <AiDemoPanel label="Ryze IA · Dois produtos em ação" title="O que a IA está fazendo agora">
            <div className="flex flex-col divide-y divide-border">
              <ProductActivityRow
                icon={GraduationCap}
                name="Ryze Academy"
                activity="Respondendo dúvida citando a fonte do conteúdo"
                stat="24/7"
              />
              <ProductActivityRow
                icon={Film}
                name="Ryze HR · Cultura"
                activity="Medindo engajamento e cultura, ciclo a ciclo"
                stat="+12pp"
              />
            </div>
          </AiDemoPanel>
        }
      />

      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <ServiceCard
            icon={GraduationCap}
            title="Ryze Academy"
            description="A universidade corporativa que responde: trilhas com uma IA treinada no conteúdo real da sua empresa, tirando dúvidas 24/7."
            highlight="87% esquece em 30 dias"
            bullets={[
              "IA responde dúvidas citando a fonte do conteúdo",
              "Presencial com QR code de presença, sem papel",
              "Onboarding estruturado, produtividade mais rápida",
            ]}
            ctaLabel="Conhecer a Ryze Academy"
            href="/produtos/academy"
          />
          <ServiceCard
            icon={Film}
            title="Ryze HR · Cultura & Engajamento"
            description="O problema de pessoas virou um problema de caixa. Escuta contínua, causa-raiz e um mentor com IA ao lado de cada líder."
            highlight="+56% de turnover no Brasil"
            bullets={[
              "Escuta contínua no WhatsApp do time",
              "Mentor com IA para cada liderança",
              "Engajamento e cultura medidos ciclo a ciclo",
            ]}
            ctaLabel="Conhecer a solução"
            href="/produtos/cultura"
          />
        </div>
      </section>

      <CtaBand
        title="Não sabe qual dos dois encaixa melhor?"
        subtitle="Fale com um especialista e descubra qual produto resolve o problema mais caro do seu momento."
        ctaLabel="Falar com um especialista"
        ctaHref="/contato"
        tone="dark"
      />
    </>
  );
}
