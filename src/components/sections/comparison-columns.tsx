import type { ReactNode } from "react";

interface ComparisonColumnsProps {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  leftLabel: string;
  leftSub: string;
  leftItems: ReactNode[];
  rightLabel: string;
  rightSub: string;
  rightItems: ReactNode[];
  footnote?: ReactNode;
}

/**
 * "A virada": modelo atual (coluna clara) vs. a entrega da Ryze (coluna
 * escura) — a estrutura de duas colunas é a mesma nos dois materiais
 * comerciais (arquivo/conhecimento vivo na Academy; foto/filme na Cultura).
 */
export function ComparisonColumns({
  eyebrow,
  title,
  intro,
  leftLabel,
  leftSub,
  leftItems,
  rightLabel,
  rightSub,
  rightItems,
  footnote,
}: ComparisonColumnsProps) {
  return (
    <section className="px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-label font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
          {eyebrow}
        </p>
        <h2 className="mt-2 max-w-3xl font-display text-display-md font-semibold text-fg">{title}</h2>
        {intro && <div className="mt-4 max-w-3xl text-body-lg text-fg-muted">{intro}</div>}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-bg-surface p-7">
            <p className="text-label font-semibold uppercase tracking-wider text-fg-muted">{leftSub}</p>
            <h3 className="mt-1 font-display text-heading-md font-semibold text-fg">{leftLabel}</h3>
            <ul className="mt-5 flex flex-col">
              {leftItems.map((item, i) => (
                <li
                  key={i}
                  className="border-b border-dashed border-border py-2.5 text-body-sm text-fg-muted last:border-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="dark rounded-xl bg-ink p-7 text-fg">
            <p className="text-label font-semibold uppercase tracking-wider text-accent-400">{rightSub}</p>
            <h3 className="mt-1 font-display text-heading-md font-semibold text-fg">{rightLabel}</h3>
            <ul className="mt-5 flex flex-col">
              {rightItems.map((item, i) => (
                <li
                  key={i}
                  className="border-b border-dashed border-border py-2.5 text-body-sm text-fg-muted last:border-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {footnote && <div className="mt-6 max-w-3xl text-body-sm text-fg-muted">{footnote}</div>}
      </div>
    </section>
  );
}
