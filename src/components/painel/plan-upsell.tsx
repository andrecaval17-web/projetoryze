import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlanUpsell({
  feature,
  requiredPlanLabel = "Impulso e Mentoria",
  benefit,
}: {
  feature: string;
  /** Ex: "Mentoria" quando o recurso é exclusivo do plano mais alto, não dos dois pagos. */
  requiredPlanLabel?: string;
  /** Copy que vende o benefício concreto da ferramenta em vez do aviso
   * genérico de bloqueio — achado #2 da segunda leva da auditoria de UX
   * (2026-07-22). Sem isso, cai no texto genérico de antes. */
  benefit?: string;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-lg border border-accent-500/30 bg-bg-surface p-10 text-center">
      <Lock className="h-8 w-8 text-accent-600 dark:text-accent-400" />
      <div>
        <h2 className="font-display text-heading-md font-semibold text-fg">
          {feature} é um recurso {requiredPlanLabel}
        </h2>
        <p className="mt-2 text-body-sm text-fg-muted">
          {benefit ?? "Faça upgrade do seu plano para desbloquear esta ferramenta."}
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/para-candidatos/painel/upgrade">Ver planos e assinar</Link>
      </Button>
    </div>
  );
}
