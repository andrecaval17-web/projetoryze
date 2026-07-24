import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { BackToPanel } from "@/components/painel/back-to-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FoldCorner } from "@/components/brand/fold-corner";
import { candidatePlans } from "@/lib/plans";
import { upgradeToPlan } from "./actions";

export const metadata: Metadata = {
  title: "Fazer upgrade — Ryze",
  robots: { index: false, follow: false },
};

const planRank: Record<string, number> = { gratis: 0, impulso: 1, mentoria: 2 };

export default async function UpgradePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plan = (await getCurrentUserPlan()) ?? "gratis";
  // Só mostra planos acima do atual — não faz sentido oferecer "upgrade"
  // pro plano que a pessoa já tem ou um inferior.
  const upgradable = candidatePlans.filter((p) => planRank[p.slug] > planRank[plan]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <BackToPanel />
      <h1 className="mt-4 font-display text-display-md font-semibold text-fg">Fazer upgrade</h1>
      <p className="mt-2 text-body-md text-fg-muted">
        Você está no plano {plan === "gratis" ? "Grátis" : plan === "impulso" ? "Impulso" : "Mentoria"}.
        Escolha um plano pago para desbloquear mais ferramentas.
      </p>

      {upgradable.length === 0 ? (
        <p className="mt-8 rounded-lg border border-border bg-bg-surface p-6 text-center text-body-md text-fg-muted">
          Você já está no plano mais completo.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {upgradable.map((p) => (
            <Card
              key={p.slug}
              className={
                p.recommended ? "flex flex-col overflow-hidden border-accent-500 shadow-glow-md ring-1 ring-accent-500" : "flex flex-col overflow-hidden"
              }
            >
              {p.recommended && <FoldCorner />}
              <div className="mb-1 flex items-center gap-2">
                <h2 className="font-display text-heading-lg font-semibold text-fg">{p.name}</h2>
                {p.recommended && <Badge variant="recommended">{p.badgeLabel}</Badge>}
              </div>
              <p className="mb-5 text-body-sm text-fg-muted">{p.tagline}</p>

              <div className="mb-1 flex items-baseline gap-1">
                <span className="font-display text-display-md font-semibold text-fg">{p.price}</span>
                {p.period && <span className="text-body-sm text-fg-muted">{p.period}</span>}
              </div>
              {p.valueNote ? (
                <p className="mb-6 text-body-sm font-medium text-accent-600 dark:text-accent-400">{p.valueNote}</p>
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
                    </Link>{" "}
                    e a{" "}
                    <Link href="/privacidade" target="_blank" className="font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400">
                      Política de Privacidade
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
          ))}
        </div>
      )}
    </div>
  );
}
