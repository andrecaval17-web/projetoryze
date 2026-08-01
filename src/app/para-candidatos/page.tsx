import type { Metadata } from "next";
import Link from "next/link";
import { FileText, MessageCircle, Sparkles, Check, X, UserCheck } from "lucide-react";
import { FoldArrow } from "@/components/brand/fold-arrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Faq } from "@/components/sections/faq";
import { Testimonials } from "@/components/sections/testimonials";
import { CandidatePricingSection } from "@/components/sections/candidate-pricing-section";
import { candidatePlans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Para Candidatos — Ryze",
  description:
    "Crie seu currículo com IA de graça, entre no grupo de vagas no WhatsApp e evolua para planos que preparam você para cada entrevista.",
};

const steps = [
  {
    icon: FileText,
    title: "Crie seu currículo grátis",
    description: "Responda algumas perguntas e a IA monta um currículo profissional em minutos.",
  },
  {
    icon: MessageCircle,
    title: "Entre no grupo de vagas",
    description: "Receba vagas todos os dias no WhatsApp — sem custo, sem cartão.",
  },
  {
    icon: Sparkles,
    title: "Evolua quando quiser",
    description: "Assine um plano para adaptar o currículo por vaga, treinar entrevistas e ter mentoria.",
  },
];

const solo = [
  "Currículo genérico que se perde na pilha",
  "Sem saber por que não te chamam",
  "Travando nas entrevistas, sem treino",
  "Meses enviando currículo sem resposta",
];

const withRyze = [
  "Currículo adaptado para cada vaga",
  "LinkedIn analisado, com o que melhorar",
  "Treino de entrevista até você ficar confiante",
  "Um especialista no seu lado (plano Mentoria)",
];

// ⚠️ DEPOIMENTOS DE EXEMPLO (fictícios) — substituir por reais e verificáveis
// antes de publicar. Depoimento inventado apresentado como real é propaganda
// enganosa (CDC art. 37).
const testimonials = [
  {
    quote:
      "Estava há 5 meses procurando e travava nas entrevistas. Com a simulação e a mentoria, passei na segunda que fiz depois.",
    name: "Mariana Alves",
    role: "Analista Administrativa",
    result: "Recolocada em 6 semanas",
  },
  {
    quote:
      "Meu currículo era genérico. A IA adaptou para cada vaga e o número de respostas mudou da água pro vinho.",
    name: "Diego Ferreira",
    role: "Assistente de Logística",
    result: "3 entrevistas em 2 semanas",
  },
  {
    quote:
      "A conversa com o consultor me deu uma clareza de carreira que eu não tinha sozinha. Fez toda a diferença na transição.",
    name: "Patrícia Gomes",
    role: "Transição para Produto",
    result: "1ª vaga na nova área",
  },
];

const faq = [
  {
    question: "Preciso de cartão de crédito para começar?",
    answer:
      "Não. O plano Grátis é 100% gratuito e para sempre: currículo com IA e entrada no grupo de vagas, sem pedir cartão.",
  },
  {
    question: "Posso cancelar os planos pagos quando quiser?",
    answer:
      "Sim. Impulso e Mentoria são assinaturas mensais e você cancela quando quiser, sem multa nem fidelidade.",
  },
  {
    question: "Como funciona o grupo de WhatsApp?",
    answer:
      "Depois de criar seu currículo grátis, você recebe o link do grupo e passa a receber vagas novas todos os dias, direto no celular.",
  },
  {
    question: "O currículo é feito por inteligência artificial mesmo?",
    answer:
      "Sim. Você informa sua experiência e a IA organiza tudo em um currículo profissional, pronto para enviar.",
  },
  {
    question: "A mentoria é com uma pessoa de verdade?",
    answer:
      "Sim. No plano Mentoria você tem uma sessão por mês com um consultor especializado em recolocação — dicas, simulação de entrevista e orientação de carreira.",
  },
];

export default function ParaCandidatosPage() {
  return (
    <>
      {/* 1. Hero — hook + CTA grátis (satisfaz quem só quer o grátis na hora) */}
      <section className="relative overflow-hidden border-b border-border px-5 py-20 text-center lg:py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgb(255 138 76 / 0.12), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl">
          <FoldArrow tone="gradient" className="mx-auto h-14 w-11 animate-float" />
          <Badge variant="accent-soft" className="mt-6">
            Para candidatos
          </Badge>
          <h1 className="mt-4 font-display text-display-xl font-semibold text-fg">
            Sua próxima oportunidade começa <span className="text-gradient-ryze">de graça</span>
          </h1>
          <p className="mt-4 text-body-lg text-fg-muted">
            Crie seu currículo com IA e entre no nosso grupo de WhatsApp com vagas
            todos os dias. Sem cartão, sem compromisso — e, quando quiser, evolua
            para se destacar em cada entrevista.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/cadastro?plano=gratis">Criar currículo grátis</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="border-border">
              <Link href="#planos">Ver planos</Link>
            </Button>
          </div>

          {/* Atalho direto — já sabe qual plano quer? Vai reto pro cadastro
              com o plano pré-selecionado, sem rolar a página até §4. */}
          <p className="mt-6 text-body-sm text-fg-muted">
            Já sabe o que quer?{" "}
            {candidatePlans.map((plan, i) => (
              <span key={plan.slug}>
                <Link
                  href={`/cadastro?plano=${plan.slug}`}
                  className="font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400"
                >
                  {plan.name}
                </Link>
                {i < candidatePlans.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 2. Como funciona — orienta a jornada antes de falar de preço */}
      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-md font-semibold text-fg">
            Como funciona
          </h2>
          <p className="mt-3 text-body-lg text-fg-muted">
            Três passos simples, do currículo grátis até se preparar para a vaga dos sonhos.
          </p>
        </div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <li key={title} className="flex flex-col items-start rounded-lg border border-border bg-bg-surface p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="font-display text-heading-md font-semibold text-gradient-ryze">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-heading-sm font-semibold text-fg">{title}</h3>
              <p className="mt-1 text-body-sm text-fg-muted">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Agitação — cria desejo pela ajuda (prepara o terreno para o Mentoria) */}
      <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-display-md font-semibold text-fg">
              Procurar sozinho é mais difícil do que precisa ser
            </h2>
            <p className="mt-3 text-body-lg text-fg-muted">
              A diferença entre continuar tentando e finalmente ser chamado
              costuma ser ter as ferramentas certas — e alguém que já fez isso
              antes ao seu lado.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-bg p-6">
              <p className="mb-4 text-label font-semibold uppercase tracking-wide text-fg-muted">
                Sozinho
              </p>
              <ul className="flex flex-col gap-3">
                {solo.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-body-md text-fg-muted">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-fg-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-accent-500/40 bg-bg p-6 shadow-glow-sm">
              <p className="mb-4 text-label font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">
                Com a Ryze
              </p>
              <ul className="flex flex-col gap-3">
                {withRyze.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-body-md text-fg">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Prova social — logo antes da decisão (⚠️ depoimentos de exemplo) */}
      <Testimonials
        title="Quem já deu o próximo passo com a Ryze"
        subtitle="Histórias de quem saiu da fila e voltou ao mercado."
        items={testimonials}
        tone="light"
      />

      {/* 4. Planos — agora que há desejo; Mentoria como escolha natural */}
      <section id="planos" className="mx-auto max-w-6xl scroll-mt-24 border-t border-border px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-md font-semibold text-fg">
            Sozinho ou com um especialista ao seu lado?
          </h2>
          <p className="mt-3 text-body-lg text-fg-muted">
            Comece de graça. Os planos pagos aceleram sua recolocação — e cada
            um inclui tudo do anterior, você só adiciona o que precisa.
          </p>
        </div>

        <CandidatePricingSection plans={candidatePlans} />

        {/* Nudge de conversão: o incremento para o Mentoria vale a pena */}
        <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-accent-500/30 bg-accent-500/5 px-6 py-5 text-center">
          <p className="text-body-md text-fg">
            <span className="font-semibold">Por cerca de R$ 1 a mais por dia</span>{" "}
            que o Impulso, a Mentoria troca &ldquo;ferramentas de IA sozinho&rdquo; por{" "}
            <span className="font-semibold">um consultor humano guiando sua recolocação</span> — quem
            está sério sobre voltar ao mercado rápido escolhe a Mentoria.
          </p>
        </div>
      </section>

      {/* 5. FAQ — quebra objeções no momento da decisão */}
      <section className="mx-auto max-w-3xl border-t border-border px-5 py-16 lg:px-8">
        <h2 className="text-center font-display text-display-md font-semibold text-fg">
          Perguntas frequentes
        </h2>
        <div className="mt-10">
          <Faq items={faq} />
        </div>
      </section>

      {/* 6. CTA final */}
      <section className="dark bg-ink px-5 py-20 text-center text-fg">
        <div className="mx-auto max-w-xl">
          <UserCheck className="mx-auto h-8 w-8 text-accent-400" />
          <h2 className="mt-4 font-display text-display-md font-semibold">
            Dê o próximo passo na sua carreira
          </h2>
          <p className="mt-3 text-body-lg text-fg-muted">
            Leva menos de 5 minutos para criar seu currículo e entrar no grupo de vagas.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/cadastro?plano=gratis">Criar currículo grátis</Link>
            </Button>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-caption text-fg-muted">
            <Check className="h-3.5 w-3.5 text-accent-400" /> Sem cartão de crédito
          </p>
        </div>
      </section>
    </>
  );
}
