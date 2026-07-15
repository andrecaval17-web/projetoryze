import Link from "next/link";
import {
  ArrowUpRight,
  Search,
  Users2,
  LineChart,
  GraduationCap,
  BrainCircuit,
  FileText,
  MessageCircle,
} from "lucide-react";
import { DarkHero } from "@/components/sections/dark-hero";
import { ResultsBand } from "@/components/sections/results-band";
import { CtaBand } from "@/components/sections/cta-band";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FoldCorner } from "@/components/brand/fold-corner";

const consultoriaItems = [
  { icon: Search, label: "Recrutamento e Seleção" },
  { icon: Users2, label: "Cultura Organizacional" },
  { icon: LineChart, label: "Remuneração Estratégica" },
  { icon: GraduationCap, label: "Treinamento e Desenvolvimento" },
];

const produtosItems = [
  { icon: BrainCircuit, label: "Recrutamento com IA — hunting e análise automática" },
  { icon: GraduationCap, label: "Educação Corporativa — trilhas personalizadas por IA" },
];

export default function Home() {
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
          { value: "10x", label: "mais rápido que a triagem manual" },
          { value: "+40", label: "critérios avaliados por candidato" },
          { value: "24/7", label: "IA analisando candidatos" },
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

      {/* Candidatos: isca de topo de funil — grátis primeiro, planos depois */}
      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <div className="relative overflow-hidden rounded-xl border border-border bg-bg-surface p-8 sm:p-10">
          <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <Badge variant="neutral" className="mb-3">
                Para candidatos
              </Badge>
              <h2 className="font-display text-heading-lg font-semibold text-fg">
                Buscando recolocação? Comece de graça.
              </h2>
              <p className="mt-2 max-w-xl text-body-md text-fg-muted">
                Crie seu currículo com IA e entre no nosso grupo de WhatsApp com
                vagas todos os dias — sem cartão de crédito, sem compromisso.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 text-body-sm text-fg">
                  <FileText className="h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                  Currículo profissional gerado por IA em minutos
                </div>
                <div className="flex items-center gap-2.5 text-body-sm text-fg">
                  <MessageCircle className="h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                  Grupo de WhatsApp com vagas diárias
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/para-candidatos">Criar currículo grátis</Link>
              </Button>
              <span className="text-caption text-fg-muted">Depois, evolua para os planos pagos.</span>
            </div>
          </div>
        </div>
      </section>

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
