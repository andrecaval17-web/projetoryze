import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { KanbanBoard, type KanbanApplication, type AnswerItem } from "../kanban-board";
import type { ApplicationStatus } from "../../actions";

export const metadata = { title: "Pipeline — Vagas Ryze" };

const RESUME_SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Tela própria pro kanban — antes vivia espremido embaixo dos dados da
 * vaga em `/vagas-admin/[id]`, sem espaço de sobra pra ser navegável de
 * verdade (achado do cliente em 2026-07-24, terceira rodada).
 */
export default async function VagaPipelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = getSupabaseAdminClient();
  const { data: job } = await supabase
    .from("ats_job_postings")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  if (!job) {
    notFound();
  }

  const { data: applications } = await supabase
    .from("ats_applications")
    .select(
      "id, name, email, phone, linkedin_url, resume_storage_path, score, score_reasoning, pipeline_status, created_at, candidate_user_id"
    )
    .eq("job_posting_id", id)
    .order("score", { ascending: false, nullsFirst: false });

  const { data: questions } = await supabase
    .from("ats_job_questions")
    .select("id, question")
    .eq("job_posting_id", id)
    .order("display_order", { ascending: true });

  const questionMap = new Map((questions ?? []).map((q) => [q.id, q.question]));

  const applicationIds = (applications ?? []).map((app) => app.id);
  const { data: answers } =
    applicationIds.length > 0
      ? await supabase
          .from("ats_application_answers")
          .select("application_id, question_id, answer")
          .in("application_id", applicationIds)
      : { data: [] };

  const answersByApplication = new Map<string, AnswerItem[]>();
  for (const answer of answers ?? []) {
    const question = questionMap.get(answer.question_id);
    if (!question) continue;
    const list = answersByApplication.get(answer.application_id) ?? [];
    list.push({ question, answer: answer.answer });
    answersByApplication.set(answer.application_id, list);
  }

  const kanbanApplications: KanbanApplication[] = await Promise.all(
    (applications ?? []).map(async (app) => {
      const { data: signed } = await supabase.storage
        .from("ats-resumes")
        .createSignedUrl(app.resume_storage_path, RESUME_SIGNED_URL_TTL_SECONDS);
      return {
        id: app.id,
        name: app.name,
        email: app.email,
        phone: app.phone,
        linkedinUrl: app.linkedin_url,
        resumeUrl: signed?.signedUrl ?? null,
        score: app.score,
        scoreReasoning: app.score_reasoning,
        pipelineStatus: app.pipeline_status as ApplicationStatus,
        createdAt: app.created_at,
        candidateUserId: app.candidate_user_id,
        answers: answersByApplication.get(app.id) ?? [],
      };
    })
  );

  return (
    <div>
      <Link
        href={`/vagas-admin/${job.id}`}
        className="inline-flex items-center gap-1.5 text-body-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {job.title}
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="font-display text-display-md font-semibold text-fg">Pipeline</h1>
        <p className="text-body-sm text-fg-muted">
          {kanbanApplications.length} candidatura{kanbanApplications.length === 1 ? "" : "s"}
        </p>
      </div>
      <p className="mt-1 text-body-sm text-fg-muted">
        Clique num card pra ver a análise completa. Selecione vários pra mover em bloco.
      </p>

      {kanbanApplications.length > 0 ? (
        <div className="mt-6">
          <KanbanBoard jobId={job.id} applications={kanbanApplications} />
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-border bg-bg-surface p-8 text-center text-body-sm text-fg-muted">
          Nenhuma candidatura recebida ainda.
        </p>
      )}
    </div>
  );
}
