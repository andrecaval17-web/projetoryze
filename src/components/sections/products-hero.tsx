import type { ReactNode } from "react";
import { AiDemoPanel, MatchRow } from "./ai-demo-panel";

interface ProductsHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  primaryCta: ReactNode;
}

/**
 * Distinct from the home DarkHero on purpose (user feedback: the two looked
 * identical). Dark, but a split layout that puts a live AI demo beside the
 * headline — so the "IA em ação" shows up immediately, not a repeat of the
 * centered arrow + stats treatment.
 */
export function ProductsHero({ eyebrow, title, subtitle, primaryCta }: ProductsHeroProps) {
  return (
    <section className="dark relative overflow-hidden bg-bg px-5 py-20 text-fg lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 78% 30%, rgb(232 92 42 / 0.22), transparent 45%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
            </span>
            <span className="text-label font-medium uppercase tracking-wider text-accent-400">
              {eyebrow}
            </span>
          </div>
          <h1 className="mt-5 font-display text-display-xl font-semibold text-fg">{title}</h1>
          <p className="mt-4 max-w-lg text-body-lg text-fg-muted">{subtitle}</p>
          <div className="mt-8">{primaryCta}</div>
        </div>

        <AiDemoPanel
          label="Ryze IA · Análise em tempo real"
          title="Ranqueando candidatos para Analista de Marketing Sênior"
        >
          <div className="flex flex-col divide-y divide-border">
            <MatchRow name="Camila Andrade" role="8 anos · Growth" match={96} />
            <MatchRow name="Rafael Nogueira" role="6 anos · Performance" match={91} />
            <MatchRow name="Beatriz Lima" role="5 anos · Conteúdo" match={84} />
            <MatchRow name="Thiago Souza" role="7 anos · Marca" match={78} />
          </div>
        </AiDemoPanel>
      </div>
    </section>
  );
}
