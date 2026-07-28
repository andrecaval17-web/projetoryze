import type { ReactNode } from "react";

interface CalcRow {
  label: string;
  value: string;
}

interface RoiCalculatorProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  punchline: string;
  rows: CalcRow[];
  totalRow: CalcRow;
  disclaimer: string;
}

/**
 * "Faça a conta": mesma calculadora dos dois materiais comerciais —
 * premissas à esquerda, linhas de cálculo destacadas à direita, terminando
 * no total e num disclaimer explícito de que é estimativa conservadora.
 */
export function RoiCalculator({
  eyebrow,
  title,
  description,
  punchline,
  rows,
  totalRow,
  disclaimer,
}: RoiCalculatorProps) {
  return (
    <section className="dark bg-ink px-5 py-16 text-fg lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-label font-semibold uppercase tracking-wider text-accent-400">{eyebrow}</p>
        <h2 className="mt-2 max-w-2xl font-display text-display-md font-semibold">{title}</h2>

        <div className="mt-8 grid gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="text-body-md text-fg-muted [&>p]:mt-3 [&>p:first-child]:mt-0">{description}</div>
            <p className="mt-5 font-display text-heading-sm font-semibold italic text-accent-400">
              {punchline}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-bg-surface p-7">
            <dl>
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-dashed border-border py-3 text-body-sm"
                >
                  <dt className="text-fg-muted">{row.label}</dt>
                  <dd className="font-semibold text-accent-400">{row.value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4">
                <dt className="text-body-md font-medium text-fg">{totalRow.label}</dt>
                <dd className="font-display text-heading-lg font-semibold text-accent-400">
                  {totalRow.value}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-caption text-fg-muted">{disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
