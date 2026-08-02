import type { ReactNode } from "react";
import { FoldArrow } from "@/components/brand/fold-arrow";
import { NeuralHero } from "@/components/brand/neural-hero";
import { cn } from "@/lib/utils";

interface DarkHeroStat {
  value: string;
  label: string;
}

interface DarkHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
  stats?: DarkHeroStat[];
  className?: string;
  /** "2xl" (padrão, Produtos Academy/Cultura) ou "lg" pra uma versão mais
   * compacta — usado em /empresas pra não competir em tamanho com a home. */
  titleSize?: "2xl" | "lg";
  /** Esconde a seta animada — usado em /empresas pra não repetir o mesmo
   * "momento de marca" da home logo na chegada (achado do cliente em
   * 2026-08-02: repetir o mesmo ícone grande reforçava a sensação de
   * página duplicada). */
  hideArrow?: boolean;
}

/**
 * The graphite/near-black, faceted, "alive" treatment reserved for AI-forward
 * moments (Home hero, Produtos hub). Forces the dark token scope on this
 * subtree regardless of the visitor's site-wide theme — see the Fase 1
 * design-system showcase (#hero-preview) for the pattern this was lifted from.
 */
export function DarkHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  stats,
  className,
  titleSize = "2xl",
  hideArrow = false,
}: DarkHeroProps) {
  return (
    <section
      className={cn(
        "dark relative flex min-h-[34rem] flex-col items-center justify-center overflow-hidden bg-bg px-5 py-24 text-center text-fg",
        className
      )}
    >
      <NeuralHero />
      {/* radial vignette so the network never fights the headline for legibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 45%, var(--bg) 30%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center">
        {!hideArrow && (
          <FoldArrow
            tone="gradient"
            className="h-20 w-16 animate-float drop-shadow-[0_0_24px_rgba(232,92,42,0.55)]"
          />
        )}

        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1",
            !hideArrow && "mt-6"
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
          </span>
          <span className="text-label font-medium uppercase tracking-wider text-accent-400">
            {eyebrow}
          </span>
        </div>

        <h1
          className={cn(
            "mt-5 max-w-3xl font-display font-semibold text-fg",
            titleSize === "lg" ? "text-display-lg" : "text-display-2xl"
          )}
        >
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-body-lg text-fg-muted">{subtitle}</p>

        {(primaryCta || secondaryCta) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {primaryCta}
            {secondaryCta}
          </div>
        )}

        {stats && stats.length > 0 && (
          <dl className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="font-display text-display-md font-semibold text-gradient-ryze">
                  {stat.value}
                </dt>
                <dd className="mt-1 max-w-[9rem] text-caption text-fg-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
