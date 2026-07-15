import Link from "next/link";
import { ArrowUpRight, Check, type LucideIcon } from "lucide-react";
import { Badge } from "./badge";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  /** A benefit-led hook, shown before the fold to earn the click. */
  description: string;
  /** Optional punchy chip (e.g. "Finalistas em até 15 dias"). */
  highlight?: string;
  /** 2–3 short proof/benefit bullets shown under the description. */
  bullets?: string[];
  ctaLabel?: string;
  href: string;
}

/**
 * Hub card built to convert: a benefit hook + a standout chip + concrete
 * bullets, so the visitor sees why it matters before clicking "saiba mais".
 */
export function ServiceCard({
  icon: Icon,
  title,
  description,
  highlight,
  bullets,
  ctaLabel = "Saiba mais",
  href,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-lg border border-border bg-bg-surface p-6 shadow-sm transition-ryze hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        {highlight && <Badge variant="accent-soft">{highlight}</Badge>}
      </div>
      <h3 className="font-display text-heading-md font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 mb-5 text-body-md text-fg-muted">{description}</p>

      {bullets && bullets.length > 0 && (
        <ul className="mb-5 flex flex-col gap-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-body-sm text-fg">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
              {b}
            </li>
          ))}
        </ul>
      )}

      <span className="mt-auto inline-flex items-center gap-1 text-body-sm font-medium text-accent-600 transition-ryze group-hover:gap-1.5 dark:text-accent-400">
        {ctaLabel}
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
