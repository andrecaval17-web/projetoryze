import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { FoldCorner } from "@/components/brand/fold-corner";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  recommended?: boolean;
  /** Text on the emphasis badge (defaults to "Recomendado"). */
  badgeLabel?: string;
  /** Small value reframing under the price, e.g. "menos de R$1,70/dia". */
  valueNote?: string;
  footnote?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  ctaLabel,
  ctaHref,
  recommended = false,
  badgeLabel = "Recomendado",
  valueNote,
  footnote,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden p-7",
        // The pushed plan is visually dominant: accent ring, glow, and lifted
        // above its neighbours so the eye lands on it as the default choice.
        recommended && "border-accent-500 shadow-glow-md ring-1 ring-accent-500 lg:-translate-y-3"
      )}
    >
      {recommended && <FoldCorner />}
      <div className="mb-1 flex items-center gap-2">
        <h3 className="font-display text-heading-lg font-semibold text-fg">{name}</h3>
        {recommended && <Badge variant="recommended">{badgeLabel}</Badge>}
      </div>
      <p className="mb-5 text-body-sm text-fg-muted">{description}</p>

      <div className="mb-1 flex items-baseline gap-1">
        <span className="font-display text-display-md font-semibold text-fg">{price}</span>
        {period && <span className="text-body-sm text-fg-muted">{period}</span>}
      </div>
      {valueNote ? (
        <p className="mb-6 text-body-sm font-medium text-accent-600 dark:text-accent-400">{valueNote}</p>
      ) : (
        <div className="mb-6" />
      )}

      <ul className="mb-7 flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-body-sm text-fg">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button asChild variant={recommended ? "primary" : "secondary"} size="lg" className="w-full">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>

      {footnote && (
        <p className="mt-3 text-center text-caption text-fg-muted">{footnote}</p>
      )}
    </Card>
  );
}
