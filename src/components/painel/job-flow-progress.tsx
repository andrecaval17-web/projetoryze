import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "curriculo", label: "Currículo" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "entrevista", label: "Entrevista" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

interface JobFlowProgressProps {
  jobTitle: string;
  current: StepKey;
  completed: Record<StepKey, boolean>;
}

/** Banner de contexto + progresso, mostrado no topo de Currículo/LinkedIn/
 * Entrevista quando acessados via `?vaga=<job_application_id>` (fluxo
 * guiado — ver HANDOFF.md). Fora desse fluxo (acesso direto às ferramentas)
 * este componente simplesmente não é renderizado pela página chamadora. */
export function JobFlowProgress({ jobTitle, current, completed }: JobFlowProgressProps) {
  return (
    <div className="mb-8 rounded-lg border border-accent-500/40 bg-bg-surface p-5">
      <p className="text-caption font-medium uppercase tracking-wide text-fg-muted">Fluxo guiado para esta vaga</p>
      <p className="mt-1 font-display text-heading-sm font-semibold text-fg">{jobTitle}</p>
      <div className="mt-4 flex items-center">
        {STEPS.map((step, i) => {
          const done = completed[step.key];
          const isCurrent = current === step.key;
          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold",
                    done
                      ? "bg-accent-500 text-white"
                      : isCurrent
                        ? "border-2 border-accent-500 text-accent-600 dark:text-accent-400"
                        : "border border-border text-fg-muted"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn("text-body-sm whitespace-nowrap", isCurrent ? "font-medium text-fg" : "text-fg-muted")}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && <span className="mx-3 h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
