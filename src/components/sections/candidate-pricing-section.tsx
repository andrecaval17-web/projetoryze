"use client";

import { useState } from "react";
import { PricingCard } from "@/components/ui/pricing-card";
import { BillingIntervalToggle } from "@/components/ui/billing-interval-toggle";
import type { CandidatePlan, BillingInterval } from "@/lib/plans";

export function CandidatePricingSection({ plans }: { plans: CandidatePlan[] }) {
  const [interval, setInterval] = useState<BillingInterval>("month");

  return (
    <>
      <div className="mt-8 flex justify-center">
        <BillingIntervalToggle interval={interval} onChange={setInterval} />
      </div>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isAnnual = interval === "year" && plan.annualPriceCents != null;
          const price = isAnnual ? plan.annualPrice! : plan.price;
          const period = isAnnual ? "/ano" : plan.period;
          const valueNote = isAnnual ? plan.annualMonthlyEquivalent : plan.valueNote;
          const ctaHref = `/cadastro?plano=${plan.slug}${isAnnual ? "&intervalo=anual" : ""}`;

          return (
            <PricingCard
              key={plan.slug}
              name={plan.name}
              price={price}
              period={period}
              description={plan.tagline}
              features={plan.features}
              ctaLabel={plan.ctaLabel}
              ctaHref={ctaHref}
              recommended={plan.recommended}
              badgeLabel={plan.badgeLabel}
              valueNote={valueNote}
              footnote={plan.footnote}
            />
          );
        })}
      </div>
    </>
  );
}
