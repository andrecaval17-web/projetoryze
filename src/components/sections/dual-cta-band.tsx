import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DualCtaBandProps {
  title: string;
  subtitle?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Closer com dois CTAs não-competitivos (falar com especialista / agendar
 * demonstração) — exceção deliberada à regra de CTA único do `CtaBand`,
 * usada só nas duas landings de produto (2026-07-26), espelhando o CTA
 * duplo que os próprios materiais comerciais usam no fechamento.
 */
export function DualCtaBand({
  title,
  subtitle,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  tone = "dark",
  className,
}: DualCtaBandProps) {
  return (
    <section
      className={cn(
        tone === "dark" ? "dark bg-ink text-fg" : "bg-bg-surface text-fg",
        "px-5 py-20 text-center",
        className
      )}
    >
      <div className="mx-auto max-w-xl">
        <h2 className="font-display text-display-md font-semibold">{title}</h2>
        {subtitle && <p className="mt-3 text-body-lg text-fg-muted">{subtitle}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
