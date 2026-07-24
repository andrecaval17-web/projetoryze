import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AudienceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  tone?: "default" | "accent";
}

/**
 * Home's "three fronts" entry points — each needs its own explicit CTA
 * (not a shared "saiba mais"), per the brief: one specific call to action
 * per audience (Consultoria / Produtos / Candidatos).
 */
export function AudienceCard({ icon: Icon, title, description, ctaLabel, href, tone = "default" }: AudienceCardProps) {
  return (
    <Card className="flex flex-col items-start p-6 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={
          tone === "accent"
            ? "flex h-11 w-11 items-center justify-center rounded-md bg-gradient-ryze text-white shadow-glow-sm"
            : "flex h-11 w-11 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400"
        }
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="mt-3 font-display text-heading-lg font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 flex-1 text-body-md text-fg-muted">{description}</p>
      <Button asChild variant="secondary" className="mt-4 w-full">
        <Link href={href}>{ctaLabel}</Link>
      </Button>
    </Card>
  );
}
