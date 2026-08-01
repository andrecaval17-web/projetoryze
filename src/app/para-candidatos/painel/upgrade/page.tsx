import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { BackToPanel } from "@/components/painel/back-to-panel";
import { candidatePlans } from "@/lib/plans";
import { UpgradePlanCards } from "./upgrade-plan-cards";

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
        <UpgradePlanCards plans={upgradable} />
      )}
    </div>
  );
}
