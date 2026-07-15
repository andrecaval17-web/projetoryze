import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "./page-hero";
import { ResultsBand, type ResultStat } from "./results-band";
import { CtaBand } from "./cta-band";
import { FoldStepIndicator, type FoldStep } from "@/components/brand/fold-step-indicator";

interface Differentiator {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Highlight {
  value: string;
  label: string;
}

interface ServicePageTemplateProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Optional custom banner; replaces the default PageHero when provided. */
  hero?: ReactNode;
  /** Ryze's own commitments (e.g. "até 15 dias") — a strip right under the hero. No source caption; these are promises, not research. */
  highlights?: Highlight[];
  painTitle: string;
  painPoints: string[];
  differentiatorsTitle: string;
  differentiators: Differentiator[];
  methodologyTitle: string;
  methodologySteps: FoldStep[];
  resultsTitle: string;
  resultsSubtitle?: string;
  results: ResultStat[];
  ctaLabel: string;
  ctaHref: string;
  ctaSubtitle?: string;
}

/**
 * Sell-first Consultoria service page:
 * hero -> commitments -> dor -> como a Ryze entrega (diferenciais) ->
 * metodologia -> resultado de mercado (com fonte) -> CTA único.
 * Differentiators are the concrete selling points; results are cited market
 * research (never invented client metrics).
 */
export function ServicePageTemplate({
  eyebrow,
  title,
  subtitle,
  hero,
  highlights,
  painTitle,
  painPoints,
  differentiatorsTitle,
  differentiators,
  methodologyTitle,
  methodologySteps,
  resultsTitle,
  resultsSubtitle,
  results,
  ctaLabel,
  ctaHref,
  ctaSubtitle,
}: ServicePageTemplateProps) {
  return (
    <>
      {hero ?? <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />}

      {highlights && highlights.length > 0 && (
        <section className="border-b border-border bg-ink px-5 py-8 lg:px-8 dark">
          <dl className="mx-auto grid max-w-4xl gap-6 text-center sm:grid-cols-3">
            {highlights.map((h) => (
              <div key={h.label} className="flex flex-col">
                <dt className="font-display text-display-md font-semibold text-gradient-ryze">
                  {h.value}
                </dt>
                <dd className="mt-1 text-body-sm text-fg-muted">{h.label}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <h2 className="font-display text-display-md font-semibold text-fg">{painTitle}</h2>
        <ul className="mt-6 flex flex-col gap-4">
          {painPoints.map((point) => (
            <li key={point} className="flex items-start gap-3 text-body-lg text-fg-muted">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-display-md font-semibold text-fg">
            {differentiatorsTitle}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {differentiators.map(({ icon: Icon, title: dTitle, description }) => (
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

      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <h2 className="text-center font-display text-display-md font-semibold text-fg">
          {methodologyTitle}
        </h2>
        <div className="mt-12 overflow-x-auto pb-2">
          <div className="min-w-[40rem]">
            <FoldStepIndicator steps={methodologySteps} currentStep={methodologySteps.length} />
          </div>
        </div>
      </section>

      <ResultsBand title={resultsTitle} subtitle={resultsSubtitle} stats={results} />

      <CtaBand title={ctaLabel} subtitle={ctaSubtitle} ctaLabel="Falar com um especialista" ctaHref={ctaHref} tone="dark" />
    </>
  );
}
