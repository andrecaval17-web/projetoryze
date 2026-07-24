import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { normalizeResumeData } from "@/lib/resume-schema";
import { BackToPanel } from "@/components/painel/back-to-panel";
import { CurriculoWorkspace, type ResumeVersionRow } from "./curriculo-workspace";

export const metadata: Metadata = {
  title: "Currículo com IA — Ryze",
  robots: { index: false, follow: false },
};

export default async function CurriculoPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cadastro?plano=gratis");
  }

  const plan = await getCurrentUserPlan();
  const isPaid = plan === "impulso" || plan === "mentoria";

  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("profile_data")
    .eq("user_id", user.id)
    .maybeSingle();

  const profileData = profile?.profile_data ? normalizeResumeData(profile.profile_data) : null;
  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || null;

  // Histórico por vaga é recurso dos planos pagos (ver src/app/para-candidatos/painel/curriculo/actions.ts).
  const { data: versions } = isPaid
    ? await supabase
        .from("resume_versions")
        .select("id, job_title, job_description, template_slug, resume_data, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: null };

  // Progresso do fluxo guiado (Currículo -> LinkedIn -> Entrevista) por
  // vaga — indexado por resume_version_id pra marcar cada card do
  // histórico com o que já foi feito.
  const { data: jobApplications } = isPaid
    ? await supabase
        .from("job_applications")
        .select("id, resume_version_id, linkedin_analysis_id, interview_session_id")
        .eq("user_id", user.id)
    : { data: null };

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
      <BackToPanel />
      <h1 className="mt-4 font-display text-display-md font-semibold text-fg">Currículo com IA</h1>
      <p className="mt-2 text-body-md text-fg-muted">
        Preencha seu perfil uma vez e reaproveite {isPaid ? "em qualquer vaga" : "no seu currículo"} — edite e
        baixe em PDF.
      </p>

      <div className="mt-8">
        <CurriculoWorkspace
          isPaid={isPaid}
          profileData={profileData}
          versions={(versions ?? []) as ResumeVersionRow[]}
          jobApplications={jobApplications ?? []}
          whatsappLink={whatsappLink}
          userId={user.id}
        />
      </div>
    </div>
  );
}
