import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { PlanUpsell } from "@/components/painel/plan-upsell";
import { BackToPanel } from "@/components/painel/back-to-panel";
import { JobFlowProgress } from "@/components/painel/job-flow-progress";
import { LinkedinForm } from "./linkedin-form";

export const metadata: Metadata = {
  title: "Análise de LinkedIn — Ryze",
  robots: { index: false, follow: false },
};

export default async function LinkedinPage({
  searchParams,
}: {
  searchParams: Promise<{ vaga?: string }>;
}) {
  const { vaga: jobApplicationId } = await searchParams;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cadastro?plano=gratis");
  }

  const plan = await getCurrentUserPlan();
  const isPaid = plan === "impulso" || plan === "mentoria";

  // Mais recente, não `.maybeSingle()` — `linkedin_analyses` é histórico
  // agora (ver 0011_evolution_panel.sql), então mais de uma linha por
  // usuário é o normal, não um erro.
  const { data: existingRows } = isPaid
    ? await supabase
        .from("linkedin_analyses")
        .select("id, analysis, score, next_steps")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
    : { data: null };
  const existing = existingRows?.[0] ?? null;

  // Só confia no `?vaga=` se a vaga existir de verdade e for do usuário
  // logado — RLS já garante isso na query, mas sem essa checagem um
  // parâmetro inválido/de outra conta silenciosamente não mostraria a
  // barra de progresso, o que é o comportamento certo mesmo (degrada pro
  // fluxo solto em vez de quebrar a página).
  const { data: jobApplication } =
    isPaid && jobApplicationId
      ? await supabase
          .from("job_applications")
          .select("id, job_title, linkedin_analysis_id")
          .eq("id", jobApplicationId)
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null };

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <BackToPanel />
      <h1 className="mt-4 font-display text-display-md font-semibold text-fg">Análise de LinkedIn</h1>
      <p className="mt-2 text-body-md text-fg-muted">
        Envie o PDF exportado do seu perfil e receba sugestões de melhoria.
      </p>

      {jobApplication && (
        <div className="mt-8">
          <JobFlowProgress
            jobTitle={jobApplication.job_title}
            current="linkedin"
            completed={{
              curriculo: true,
              linkedin: !!jobApplication.linkedin_analysis_id,
              entrevista: false,
            }}
          />
        </div>
      )}

      <div className={jobApplication ? "" : "mt-8"}>
        {isPaid ? (
          <LinkedinForm
            existingAnalysis={existing?.analysis ?? null}
            existingScore={existing?.score ?? null}
            existingNextSteps={existing?.next_steps ?? null}
            existingAnalysisId={existing?.id ?? null}
            jobApplicationId={jobApplication?.id}
            alreadyLinkedToJob={!!jobApplication?.linkedin_analysis_id}
          />
        ) : (
          <PlanUpsell
            feature="Análise de LinkedIn"
            benefit="Descubra o que está te fazendo perder oportunidades no LinkedIn — envie seu perfil e receba uma análise em minutos."
          />
        )}
      </div>
    </div>
  );
}
