import { cn } from "@/lib/utils";
import { FoldArrow } from "./fold-arrow";

export interface FoldStep {
  label: string;
  description?: string;
}

interface FoldStepIndicatorProps {
  steps: FoldStep[];
  /** Zero-indexed current step. Steps before it are complete. */
  currentStep: number;
  className?: string;
}

/**
 * Indicator for a real sequence of steps (e.g. the selection process).
 * Nodes use the brand's faceted hexagon shape; connectors use the fold
 * arrow rotated to point forward, lighting up as the sequence advances.
 */
export function FoldStepIndicator({
  steps,
  currentStep,
  className,
}: FoldStepIndicatorProps) {
  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((step, i) => {
        const state =
          i < currentStep ? "done" : i === currentStep ? "current" : "upcoming";

        return (
          <li key={step.label} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center text-center">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center font-display text-sm font-semibold transition-ryze",
                  state === "upcoming" && "bg-bg-surface-2 text-fg-muted",
                  state === "current" &&
                    "bg-gradient-ryze text-white shadow-md",
                  state === "done" && "bg-ink text-paper dark:bg-neutral-100 dark:text-ink"
                )}
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
                aria-current={state === "current" ? "step" : undefined}
              >
                {state === "done" ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "mt-2 max-w-[9rem] text-label font-medium",
                  state === "upcoming" ? "text-fg-muted" : "text-fg"
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="mt-0.5 max-w-[10rem] text-caption text-fg-muted">
                  {step.description}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="mt-5 flex flex-1 items-center px-1">
                <span
                  className={cn(
                    "h-px flex-1 transition-ryze",
                    i < currentStep ? "bg-accent-500" : "bg-border"
                  )}
                />
                <FoldArrow
                  tone={i < currentStep ? "gradient" : "current"}
                  className={cn(
                    "h-3 w-2.5 -rotate-90",
                    i >= currentStep && "text-border-strong opacity-60"
                  )}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
