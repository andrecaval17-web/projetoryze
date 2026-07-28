import type { ReactNode } from "react";

interface PainPoint {
  title: string;
  description: string;
}

interface PainGridProps {
  title: string;
  points: PainPoint[];
  calloutTitle: string;
  calloutBody: ReactNode;
}

/**
 * "Por que o kit atual não resolve": 3 dores em cards claros + um destaque
 * escuro pro ponto cego que amarra a seção (mesmo recurso visual dos dois
 * materiais comerciais — Academy e Cultura usam essa mesma estrutura).
 */
export function PainGrid({ title, points, calloutTitle, calloutBody }: PainGridProps) {
  return (
    <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-display-md font-semibold text-fg">{title}</h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {points.map((point) => (
            <div key={point.title} className="rounded-lg border border-border bg-bg p-6">
              <h3 className="font-display text-heading-sm font-semibold text-fg">{point.title}</h3>
              <p className="mt-2 text-body-sm text-fg-muted">{point.description}</p>
            </div>
          ))}
        </div>

        <div className="dark mt-6 grid gap-5 rounded-xl bg-ink p-8 text-fg sm:grid-cols-[10rem_1fr] sm:items-start">
          <span className="font-display text-heading-md font-semibold text-gradient-ryze">
            {calloutTitle}
          </span>
          <p className="text-body-md text-fg-muted">{calloutBody}</p>
        </div>
      </div>
    </section>
  );
}
