"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FoldCorner } from "@/components/brand/fold-corner";
import { BillingIntervalToggle } from "@/components/ui/billing-interval-toggle";
import type { CandidatePlan, BillingInterval } from "@/lib/plans";
import { upgradeToPlan } from "./actions";

export function UpgradePlanCards({ plans }: { plans: CandidatePlan[] }) {
  const [interval, setInterval] = useState<BillingInterval>("month");
  const hasAnnual = plans.some((p) => p.annualPriceCents != null);

  return (
    <>
      {hasAnnual && (
        <div className="mt-8 flex justify-center">
          <BillingIntervalToggle interval={interval} onChange={setInterval} />
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {plans.map((p) => {
          const isAnnual = interval === "year" && p.annualPriceCents != null;
          const price = isAnnual ? p.annualPrice! : p.price;
          const period = isAnnual ? "/ano" : p.period;
          const valueNote = isAnnual ? p.annualMonthlyEquivalent : p.valueNote;

          return (
            <Card
              key={p.slug}
              className={
                p.recommended
                  ? "flex flex-col overflow-hidden border-accent-500 shadow-glow-md ring-1 ring-accent-500"
                  : "flex flex-col overflow-hidden"
              }
            >
              {p.recommended && <FoldCorner />}
              <div className="mb-1 flex items-center gap-2">
                <h2 className="font-display text-heading-lg font-semibold text-fg">{p.name}</h2>
                {p.recommended && <Badge variant="recommended">{p.badgeLabel}</Badge>}
              </div>
              <p className="mb-5 text-body-sm text-fg-muted">{p.tagline}</p>

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
                {p.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-body-sm text-fg">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <form action={upgradeToPlan} className="flex flex-col gap-3">
                <input type="hidden" name="plan" value={p.slug} />
                <input type="hidden" name="interval" value={isAnnual ? "year" : "month"} />
                <label className="flex items-start gap-2.5 text-caption text-fg-muted">
                  <input
                    name="acceptedTerms"
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-accent-600 focus-visible:outline-2 focus-visible:outline-accent-500"
                  />
                  <span>
                    Li e concordo com os{" "}
                    <Link href="/termos" target="_blank" className="font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400">
                      Termos de Uso
                    </Link>
                    {", "}a{" "}
                    <Link href="/privacidade" target="_blank" className="font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400">
                      Política de Privacidade
                    </Link>
                    {" "}e a{" "}
                    <Link href="/politica-cancelamento" target="_blank" className="font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400">
                      Política de Cancelamento e Reembolso
                    </Link>
                    .
                  </span>
                </label>
                <Button type="submit" variant={p.recommended ? "primary" : "secondary"} size="lg" className="w-full">
                  {p.ctaLabel}
                </Button>
              </form>

              {p.footnote && <p className="mt-3 text-center text-caption text-fg-muted">{p.footnote}</p>}
            </Card>
          );
        })}
      </div>
    </>
  );
}
