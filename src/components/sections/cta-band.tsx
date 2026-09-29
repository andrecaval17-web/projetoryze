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
 *
 * `ctaHref` absoluto (ex: link de WhatsApp) abre em nova aba automaticamente
 * — usado pelos CTAs "Falar com um especialista" que foram trocados de
 * /contato (formulário com erro de envio) para wa.me em 2026-08-12.
 */
export function CtaBand({ title, subtitle, ctaLabel, ctaHref, tone = "light", className }: CtaBandProps) {
  const isExternal = ctaHref.startsWith("http");

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
          {isExternal ? (
            <a href={ctaHref} target="_blank" rel="noopener noreferrer">{ctaLabel}</a>
          ) : (
            <Link href={ctaHref}>{ctaLabel}</Link>
          )}
        </Button>
      </div>
    </section>
  );
}
