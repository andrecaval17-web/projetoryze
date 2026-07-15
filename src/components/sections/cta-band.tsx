import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaBandProps {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Single, unambiguous CTA to close out a page — deliberately never paired
 * with a second competing action (see the Consultoria UX principle: one
 * CTA per service page, not several).
 */
export function CtaBand({ title, subtitle, ctaLabel, ctaHref, tone = "light", className }: CtaBandProps) {
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
        <Button asChild size="lg" className="mt-8">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
