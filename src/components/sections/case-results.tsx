interface CaseMetric {
  value: string;
  label: string;
}

interface NamedCase {
  name: string;
  result: string;
  duration: string;
}

interface CaseResultsProps {
  title: string;
  subtitle?: string;
  metrics: CaseMetric[];
  note?: string;
  casesTitle: string;
  cases: NamedCase[];
}

/**
 * "Prova": resultados medidos em clientes reais da Ryze — deliberadamente
 * SEM legenda de fonte (diferente de `ResultsBand`, que é só pra pesquisa de
 * mercado citada). Usado apenas em /produtos/cultura, onde o material
 * comercial nomeia clientes de verdade com resultado medido.
 */
export function CaseResults({ title, subtitle, metrics, note, casesTitle, cases }: CaseResultsProps) {
  return (
    <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-md font-semibold text-fg">{title}</h2>
          {subtitle && <p className="mt-3 text-body-lg text-fg-muted">{subtitle}</p>}
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border bg-bg p-5 text-center">
              <dt className="font-display text-display-md font-semibold text-gradient-ryze">{m.value}</dt>
              <dd className="mt-1 text-body-sm text-fg-muted">{m.label}</dd>
            </div>
          ))}
        </dl>
        {note && <p className="mt-6 text-center text-body-sm text-fg-muted">{note}</p>}

        <div className="mt-12 rounded-xl border border-border bg-bg p-7">
          <h3 className="font-display text-heading-sm font-semibold text-fg">{casesTitle}</h3>
          <ul className="mt-4 flex flex-col">
            {cases.map((c) => (
              <li
                key={c.name}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed border-border py-3 last:border-0"
              >
                <span className="font-medium text-fg">{c.name}</span>
                <span className="text-body-sm text-fg-muted">
                  {c.result} <span className="text-fg-muted/70">· {c.duration}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
