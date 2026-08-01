import { cn } from "@/lib/utils";
import type { BillingInterval } from "@/lib/plans";

interface BillingIntervalToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  className?: string;
}

export function BillingIntervalToggle({ interval, onChange, className }: BillingIntervalToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Cobrança mensal ou anual"
      className={cn("inline-flex items-center gap-1 rounded-md bg-bg-surface-2 p-1", className)}
    >
      <button
        type="button"
        role="tab"
        aria-selected={interval === "month"}
        onClick={() => onChange("month")}
        className={cn(
          "rounded-[5px] px-4 py-2 text-body-sm font-medium transition-ryze",
          interval === "month" ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg"
        )}
      >
        Mensal
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={interval === "year"}
        onClick={() => onChange("year")}
        className={cn(
          "flex items-center gap-2 rounded-[5px] px-4 py-2 text-body-sm font-medium transition-ryze",
          interval === "year" ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg"
        )}
      >
        Anual
        <span className="rounded-full bg-accent-500/15 px-2 py-0.5 text-caption font-semibold text-accent-600 dark:text-accent-400">
          Economize 20%
        </span>
      </button>
    </div>
  );
}
