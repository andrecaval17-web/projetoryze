import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Light, paper-toned intro for institutional subpages (Consultoria, Sobre,
 * Contato). Kept deliberately calm — the "tech" energy is reserved for the
 * dark hero / AI touchpoints, this is the "humano, acolhedor" register.
 */
export function PageHero({ eyebrow, title, subtitle, className, children }: PageHeroProps) {
  return (
    <section className={cn("border-b border-border px-5 py-16 text-center lg:py-20", className)}>
      <div className="mx-auto max-w-3xl">
        {eyebrow && (
          <Badge variant="accent-soft" className="mb-4">
            {eyebrow}
          </Badge>
        )}
        <h1 className="font-display text-display-xl font-semibold text-fg">{title}</h1>
        {subtitle && <p className="mt-4 text-body-lg text-fg-muted">{subtitle}</p>}
        {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
