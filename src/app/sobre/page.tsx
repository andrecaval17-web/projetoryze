import type { Metadata } from "next";
import { HeartHandshake, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { buildContactWhatsappHref } from "@/lib/whatsapp-number";

export const metadata: Metadata = {
  title: "Sobre — Ryze",
  description: "Consultoria em Recursos Humanos que une metodologia humana e inteligência artificial aplicada.",
};

const values = [
  {
    icon: HeartHandshake,
    title: "Pessoas no centro",
    description: "Tecnologia acelera processo, mas quem decide, acolhe e desenvolve continua sendo gente.",
  },
  {
    icon: Gauge,
    title: "Resultado, não relatório",
    description: "Medimos sucesso pelo indicador que muda — turnover, tempo de contratação, engajamento — não pela apresentação.",
  },
  {
    icon: ShieldCheck,
    title: "Critério antes de velocidade",
    description: "IA acelera o que já é bem definido. Não usamos tecnologia para pular etapa que exige julgamento humano.",
  },
  {
    icon: Sparkles,
    title: "Tecnologia aplicada, não vitrine",
    description: "Cada produto de IA que construímos resolve um gargalo real que vimos repetidamente em consultoria.",
  },
];

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre a Ryze"
        title="Pessoas no centro, tecnologia a favor"
        subtitle="Nascemos como consultoria de Recursos Humanos e, ao ver os mesmos gargalos se repetirem em toda contratação, começamos a construir a inteligência artificial que faltava para resolvê-los."
      />

      <section className="mx-auto max-w-3xl px-5 py-16 text-body-lg text-fg-muted lg:px-8">
        <p>
          A Ryze existe para um problema simples de descrever e difícil de
          resolver: RH que toma boas decisões sobre pessoas, de forma
          consistente, sem depender só de tempo e sorte.
        </p>
        <p className="mt-5">
          Do lado da consultoria, isso significa metodologia — recrutamento
          estruturado, cultura desenhada de propósito, cargos e salários
          justos, treinamento que muda indicador. Do lado da tecnologia,
          significa inteligência artificial aplicada exatamente onde o
          trabalho manual mais atrasa: triagem de candidatos, análise de
          currículos, geração de trilhas de desenvolvimento.
        </p>
        <p className="mt-5">
          E para quem está do outro lado da mesa — o candidato — significa
          ferramentas de IA e mentoria humana para chegar mais preparado à
          próxima oportunidade.
        </p>
      </section>

      <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-display-md font-semibold text-fg">
            Como pensamos
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 rounded-lg border border-border bg-bg p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-display text-heading-sm font-semibold text-fg">{title}</h3>
                  <p className="mt-1 text-body-sm text-fg-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Quer conhecer a Ryze de perto?"
        subtitle="Fale com a gente e entenda como podemos ajudar o seu RH."
        ctaLabel="Entrar em contato"
        ctaHref={buildContactWhatsappHref("os serviços da Ryze")}
      />
    </>
  );
}
