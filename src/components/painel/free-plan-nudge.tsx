import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Equivalente ao GuidedJourney (guided-journey.tsx), mas pro plano Grátis —
 * achado #1 da segunda leva da auditoria de UX de 2026-07-22: antes disso o
 * candidato Grátis só via uma linha de texto discreta no rodapé do painel
 * como nudge de upgrade. Não reusa o componente inteiro porque a "jornada"
 * de passos (perfil → adaptar → LinkedIn → entrevista → mentoria) não faz
 * sentido pra quem não tem acesso a quase nenhum desses passos ainda — aqui
 * é uma mensagem única e um CTA forte, não uma barra de progresso.
 */
export function FreePlanNudge() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-accent-500/40 bg-bg-surface p-6 shadow-glow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
          <Compass className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-heading-sm font-semibold text-fg">Você já tem currículo</h2>
          <p className="mt-1 text-body-sm text-fg-muted">
            Próximo passo: desbloqueie ferramentas Impulso pra parar de enviar currículo genérico.
          </p>
        </div>
      </div>
      <Button asChild size="sm">
        <Link href="/para-candidatos/painel/upgrade">
          Desbloquear Impulso <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
