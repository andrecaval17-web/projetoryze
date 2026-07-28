import { cn } from "@/lib/utils";

export interface ResultStat {
  value: string;
  label: string;
  /** Attribution shown as "Fonte: …" — these are market-research figures, not Ryze client results. */
  source: string;
}

interface ResultsBandProps {
  title: string;
  subtitle?: string;
  stats: ResultStat[];
  /** Optional closing remark shown below the stat grid, inside the same band — for a note that comments on the stats above without becoming its own orphaned section. */
  note?: string;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Results/impact band backed by cited third-party research (Gallup, SHRM,
 * LinkedIn Learning, Payscale, …). Deliberately sourced rather than fake
 * client metrics — the "Fonte:" caption is what makes the number credible
 * commercially instead of looking invented.
 */
export function ResultsBand({ title, subtitle, stats, note, tone = "light", className }: ResultsBandProps) {
  return (
    <section
      className={cn(
        tone === "dark" ? "dark bg-ink text-fg" : "border-y border-border bg-bg-surface text-fg",
        "px-5 py-16 lg:px-8",
        className
      )}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-md font-semibold">{title}</h2>
          {subtitle && <p className="mt-3 text-body-lg text-fg-muted">{subtitle}</p>}
        </div>

        <dl className="mt-12 grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col rounded-lg border border-border bg-bg p-6"
            >
              <dt className="font-display text-display-lg font-semibold text-gradient-ryze">
                {stat.value}
              </dt>
              <dd className="mt-2 text-body-sm text-fg">{stat.label}</dd>
              <p className="mt-4 text-caption text-fg-muted">Fonte: {stat.source}</p>
            </div>
          ))}
        </dl>

        {note && <p className="mx-auto mt-8 max-w-2xl text-center text-body-md text-fg-muted">{note}</p>}
      </div>
    </section>
  );
}
