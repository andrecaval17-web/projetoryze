import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, MessageSquare } from "lucide-react";
import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { BackToPanel } from "@/components/painel/back-to-panel";
import { PlanUpsell } from "@/components/painel/plan-upsell";
import { LinkedinIcon } from "@/components/ui/social-icons";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Painel de evolução — Ryze",
  robots: { index: false, follow: false },
};

interface LinkedinScoreRow {
  id: string;
  score: number | null;
  created_at: string;
}

export default async function EvolucaoPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cadastro?plano=gratis");
  }

  const plan = await getCurrentUserPlan();
  const isPaid = plan === "impulso" || plan === "mentoria";

  // Achado da auditoria de UX (2026-07-23): antes disso, o candidato Grátis
  // entrava aqui e via só indicadores zerados/travados — mesmo padrão de
  // paywall das outras ferramentas pagas (linkedin/page.tsx, entrevista/
  // page.tsx) agora, em vez de deixar entrar pra ver uma tela vazia.
  if (!isPaid) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <BackToPanel />
        <h1 className="mt-4 font-display text-display-md font-semibold text-fg">Painel de evolução</h1>
        <p className="mt-2 text-body-md text-fg-muted">
          Acompanhe o que você já produziu na busca pela recolocação.
        </p>
        <div className="mt-8">
          <PlanUpsell
            feature="Painel de evolução"
            benefit="Acompanhe sua evolução de verdade — currículos adaptados por vaga, simulações de entrevista e pontuação do LinkedIn, tudo num só lugar, semana após semana."
          />
        </div>
      </div>
    );
  }

  const { count: resumeCount } = await supabase
    .from("resume_versions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: scoreHistory } = await supabase
    .from("linkedin_analyses")
    .select("id, score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: interviewCount } = await supabase
    .from("interview_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("finished", true);

  const scoredHistory = ((scoreHistory ?? []) as LinkedinScoreRow[]).filter((r) => typeof r.score === "number");

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <BackToPanel />
      <h1 className="mt-4 font-display text-display-md font-semibold text-fg">Painel de evolução</h1>
      <p className="mt-2 text-body-md text-fg-muted">
        Acompanhe o que você já produziu na busca pela recolocação.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-bg-surface p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
            <FileText className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-display text-heading-md font-semibold text-fg">{resumeCount ?? 0}</p>
            <p className="text-body-sm text-fg-muted">Currículos adaptados por vaga</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-border bg-bg-surface p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
            <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-display text-heading-md font-semibold text-fg">{interviewCount ?? 0}</p>
            <p className="text-body-sm text-fg-muted">Simulações de entrevista concluídas</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-bg-surface p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
            <LinkedinIcon className="h-4.5 w-4.5" />
          </span>
          <h2 className="font-display text-heading-sm font-semibold text-fg">Pontuação do LinkedIn</h2>
        </div>

        {scoredHistory.length === 0 ? (
          <p className="text-body-sm text-fg-muted">
            Nenhuma análise ainda.{" "}
            <Link href="/para-candidatos/painel/linkedin" className="font-medium text-accent-600 dark:text-accent-400">
              Analisar meu LinkedIn
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {scoredHistory.map((row) => (
              <li key={row.id} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-caption text-fg-muted">
                  {new Date(row.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg-surface-2">
                  <div
                    className="h-full rounded-full bg-gradient-ryze"
                    style={{ width: `${row.score}%` }}
                  />
                </div>
                <Badge variant={(row.score ?? 0) >= 70 ? "recommended" : "neutral"} className="w-16 justify-center">
                  {row.score}/100
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
