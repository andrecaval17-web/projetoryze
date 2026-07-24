import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { PlanUpsell } from "@/components/painel/plan-upsell";
import { BackToPanel } from "@/components/painel/back-to-panel";
import { JobFlowProgress } from "@/components/painel/job-flow-progress";
import { InterviewChat } from "./interview-chat";

export const metadata: Metadata = {
  title: "Simulação de entrevista — Ryze",
  robots: { index: false, follow: false },
};

export default async function EntrevistaPage({
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

  const { data: jobApplication } =
    isPaid && jobApplicationId
      ? await supabase
          .from("job_applications")
          .select("id, job_title, linkedin_analysis_id, interview_session_id")
          .eq("id", jobApplicationId)
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null };

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
      <BackToPanel />
      <h1 className="mt-4 font-display text-display-md font-semibold text-fg">
        Simulação de entrevista
      </h1>
      <p className="mt-2 text-body-md text-fg-muted">
        Treine por voz com uma IA entrevistadora, focada na área que você busca.
      </p>

      {jobApplication && (
        <div className="mt-8">
          <JobFlowProgress
            jobTitle={jobApplication.job_title}
            current="entrevista"
            completed={{
              curriculo: true,
              linkedin: !!jobApplication.linkedin_analysis_id,
              entrevista: !!jobApplication.interview_session_id,
            }}
          />
        </div>
      )}

      <div className={jobApplication ? "" : "mt-8"}>
        {isPaid ? (
          <InterviewChat
            initialJobContext={jobApplication?.job_title}
            jobApplicationId={jobApplication?.id}
          />
        ) : (
          <PlanUpsell
            feature="Simulação de entrevista"
            benefit="Chegue confiante na entrevista real — treine por voz com uma IA entrevistadora e erre aqui, não na vaga que você quer."
          />
        )}
      </div>
    </div>
  );
}
