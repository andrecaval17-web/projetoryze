import type { Metadata } from "next";
import { Award, Cpu, Timer, Target, Layers, ShieldCheck, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ResultsBand } from "@/components/sections/results-band";
import { CtaBand } from "@/components/sections/cta-band";
import { Faq } from "@/components/sections/faq";
import { FoldStepIndicator } from "@/components/brand/fold-step-indicator";
import { Button } from "@/components/ui/button";
import { WhatsappClickLink } from "@/components/whatsapp/whatsapp-click-link";
import { RecruitmentLeadForm } from "./lead-form";
import { buildPageMetadata } from "@/lib/seo";
import { buildContactWhatsappHref } from "@/lib/whatsapp-number";
import {
  CREDENTIALS_LINE,
  JOBS_CONDUCTED_TEXT,
  METHODOLOGY_TITLE,
  METHODOLOGY_STEPS,
  GUARANTEE_TEXT,
  RECRUITMENT_FAQ_ITEMS,
  RECRUITMENT_FAQ_JSON_LD,
} from "@/lib/recruitment-content";

const WHATSAPP_HREF = buildContactWhatsappHref("Recrutamento e Seleção");

const DIFFERENTIATORS = [
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
];

const PAIN_POINTS = [
  "Vagas abertas por meses sobrecarregam o time e travam entregas.",
  "Contratações por urgência que não passam do período de experiência.",
  "Processos lentos e desorganizados afastam os melhores candidatos — que têm outras ofertas.",
  "Falta de critério objetivo para avaliar fit técnico e cultural.",
];

const RESULTS = [
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
];

export const metadata: Metadata = buildPageMetadata({
  title: "Recrutamento e Seleção — Ryze Consultoria",
  description:
    "Recrutadores com mais de 10 anos de experiência e tecnologia no processo: candidatos finalistas em até 15 dias, de vagas operacionais a estratégicas.",
  path: "/consultoria/recrutamento-e-selecao",
});

export default function RecrutamentoESelecaoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(RECRUITMENT_FAQ_JSON_LD) }} />

      <PageHero
        eyebrow="Recrutamento e Seleção"
        title="Os candidatos certos, mais rápido que o mercado"
        subtitle="Recrutadores sêniores e tecnologia no processo para entregar finalistas qualificados em até 15 dias — de vagas operacionais a posições estratégicas."
        afterSubtitle={<p className="mt-3 text-body-sm font-medium text-fg-muted">{CREDENTIALS_LINE}</p>}
      >
        <Button asChild size="lg">
          <a href="#formulario-contato">Quero contratar</a>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <WhatsappClickLink href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" button="hero_secondary">
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </WhatsappClickLink>
        </Button>
      </PageHero>

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <h2 className="font-display text-display-md font-semibold text-fg">Contratar devagar e errado custa caro</h2>
        <ul className="mt-6 flex flex-col gap-4">
          {PAIN_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3 text-body-lg text-fg-muted">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-display-md font-semibold text-fg">Vagas que já conduzimos</h2>
          <p className="mt-6 text-body-lg text-fg-muted">{JOBS_CONDUCTED_TEXT}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <h2 className="text-center font-display text-display-md font-semibold text-fg">{METHODOLOGY_TITLE}</h2>
        <div className="mt-12 overflow-x-auto pb-2">
          <div className="min-w-[40rem]">
            <FoldStepIndicator steps={METHODOLOGY_STEPS} currentStep={METHODOLOGY_STEPS.length} />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-display-md font-semibold text-fg">
            Como a Ryze entrega mais rápido e com mais assertividade
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {DIFFERENTIATORS.map(({ icon: Icon, title: dTitle, description }) => (
              <div key={dTitle} className="flex gap-4 rounded-lg border border-border bg-bg p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-ryze text-white shadow-glow-sm">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-display text-heading-sm font-semibold text-fg">{dTitle}</h3>
                  <p className="mt-1 text-body-sm text-fg-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <h2 className="font-display text-display-md font-semibold text-fg">Garantia de reposição</h2>
        <p className="mt-6 text-body-lg text-fg-muted">{GUARANTEE_TEXT}</p>
      </section>

      <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-display-md font-semibold text-fg">Perguntas frequentes</h2>
          <div className="mt-10">
            <Faq items={RECRUITMENT_FAQ_ITEMS} />
          </div>
        </div>
      </section>

      <section id="formulario-contato" className="mx-auto max-w-xl px-5 py-16 lg:px-8">
        <h2 className="text-center font-display text-display-md font-semibold text-fg">
          Deixe seus dados que entramos em contato
        </h2>
        <p className="mt-2 text-center text-body-sm text-fg-muted">
          Preencha abaixo — nosso time comercial responde o mais rápido possível.
        </p>
        <div className="mt-8 rounded-xl border border-border bg-bg p-6 sm:p-8">
          <RecruitmentLeadForm />
        </div>
      </section>

      <ResultsBand
        title="Por que método e tecnologia importam"
        subtitle="Dados de mercado sobre o impacto de selecionar com estrutura e agilidade — a base da nossa forma de trabalhar."
        stats={RESULTS}
      />

      <CtaBand
        title="Pronto para contratar melhor e mais rápido?"
        subtitle="Fale com um especialista e receba finalistas qualificados em até 15 dias."
        ctaLabel="Falar com um especialista"
        ctaHref={WHATSAPP_HREF}
        tone="dark"
      />
    </>
  );
}
