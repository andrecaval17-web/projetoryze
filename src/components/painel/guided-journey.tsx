"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  Sparkles,
  X,
  FileText,
  Briefcase,
  MessageSquare,
  CalendarCheck,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkedinIcon } from "@/components/ui/social-icons";
import { dismissOnboardingIntro } from "@/app/para-candidatos/painel/onboarding-actions";
import { type OnboardingStep } from "@/lib/guided-flow";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<OnboardingStep["key"], React.ComponentType<{ className?: string }>> = {
  perfil: FileText,
  adaptar: Briefcase,
  linkedin: LinkedinIcon,
  entrevista: MessageSquare,
  mentoria: CalendarCheck,
};

interface GuidedJourneyProps {
  subscriptionId: string;
  steps: OnboardingStep[];
  planLabel: string;
  /** Só `true` na primeira renderização em que `onboarding_seen_at` ainda
   * era `null` no servidor — abre a introdução sozinha. */
  showIntroInitially: boolean;
}

export function GuidedJourney({ subscriptionId, steps, planLabel, showIntroInitially }: GuidedJourneyProps) {
  const [introOpen, setIntroOpen] = useState(showIntroInitially);
  const [, startDismiss] = useTransition();

  const doneCount = steps.filter((s) => s.done).length;
  const currentIndex = steps.findIndex((s) => !s.done);
  const isComplete = currentIndex === -1;
  const currentStep = isComplete ? null : steps[currentIndex];
  const progressPct = Math.round((doneCount / steps.length) * 100);

  function closeIntro() {
    setIntroOpen(false);
    // Idempotente — reabrir via "Ver meu guia" e fechar de novo só regrava
    // o mesmo timestamp, sem efeito colateral.
    startDismiss(async () => {
      await dismissOnboardingIntro(subscriptionId);
    });
  }

  return (
    <>
      <div className="mb-8 rounded-lg border border-accent-500/40 bg-bg-surface p-6 shadow-glow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-heading-sm font-semibold text-fg">Sua jornada guiada</h2>
              <p className="mt-1 text-body-sm text-fg-muted">
                {isComplete
                  ? "Você concluiu todos os passos disponíveis no seu plano."
                  : currentStep!.title}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-caption text-fg-muted">
              {doneCount}/{steps.length} passos
            </span>
            {!isComplete && !currentStep!.locked && (
              <Button asChild size="sm">
                <Link href={currentStep!.href}>
                  Continuar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            {!isComplete && currentStep!.locked && (
              <Button asChild size="sm" variant="secondary">
                <Link href="/para-candidatos/painel/upgrade">Desbloquear Mentoria</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-ryze transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => setIntroOpen(true)}
          className="mt-3 text-caption font-medium text-accent-600 transition-ryze hover:underline dark:text-accent-400"
        >
          Ver meu guia completo
        </button>
      </div>

      {introOpen && (
        <OnboardingIntroModal steps={steps} planLabel={planLabel} onClose={closeIntro} />
      )}
    </>
  );
}

function OnboardingIntroModal({
  steps,
  planLabel,
  onClose,
}: {
  steps: OnboardingStep[];
  planLabel: string;
  onClose: () => void;
}) {
  const [screen, setScreen] = useState(0);
  const totalScreens = 3;
  // O passo pra onde o CTA final leva — o próximo pendente, não sempre o
  // passo 1 (reabrir "Ver meu guia" depois de já ter avançado não deve
  // mandar a pessoa de volta pro início).
  const nextPendingStep = steps.find((s) => !s.done) ?? steps[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-bg-surface p-8 shadow-glow-md">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar introdução"
          className="absolute right-4 top-4 text-fg-muted transition-ryze hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>

        {screen === 0 && (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
              <Sparkles className="h-7 w-7" />
            </span>
            <h2 className="font-display text-heading-md font-semibold text-fg">
              Bem-vindo(a) ao plano {planLabel}
            </h2>
            <p className="text-body-md text-fg-muted">
              Preparamos um caminho sugerido pra você tirar o máximo das ferramentas — não precisa seguir à
              risca, mas é por aqui que a maioria dos candidatos tem os melhores resultados.
            </p>
          </div>
        )}

        {screen === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-heading-md font-semibold text-fg">A jornada sugerida</h2>
            <ol className="flex flex-col gap-3">
              {steps.map((step, i) => {
                const Icon = STEP_ICONS[step.key];
                return (
                  <li key={step.key} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption font-semibold",
                        step.locked
                          ? "bg-bg-surface-2 text-fg-muted"
                          : "bg-accent-500/15 text-accent-600 dark:text-accent-400"
                      )}
                    >
                      {step.locked ? <Lock className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-body-sm font-medium text-fg">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-fg-muted" />
                        {step.title}
                        {step.locked && (
                          <span className="text-caption font-normal text-fg-muted">(plano Mentoria)</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-caption text-fg-muted">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {screen === 2 && (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
              <Check className="h-7 w-7" />
            </span>
            <h2 className="font-display text-heading-md font-semibold text-fg">Vamos começar?</h2>
            <p className="text-body-md text-fg-muted">
              Esse guia continua disponível no topo da sua área a qualquer momento — não precisa memorizar
              nada agora.
            </p>
            <Button asChild size="lg" onClick={onClose} className="w-full sm:w-auto">
              <Link href={nextPendingStep.href}>
                {nextPendingStep.done ? "Ver minha área" : `Ir para "${nextPendingStep.title}"`}{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-caption font-medium text-fg-muted transition-ryze hover:text-fg"
          >
            Pular introdução
          </button>
          <div className="flex items-center gap-3">
            {screen > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setScreen((s) => s - 1)}>
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </Button>
            )}
            {screen < totalScreens - 1 && (
              <Button type="button" size="sm" onClick={() => setScreen((s) => s + 1)}>
                Próximo <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: totalScreens }).map((_, i) => (
            <span
              key={i}
              className={cn("h-1.5 w-1.5 rounded-full", i === screen ? "bg-accent-500" : "bg-border-strong")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
