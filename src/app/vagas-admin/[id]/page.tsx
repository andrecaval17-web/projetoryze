import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { AiMarkdown } from "@/components/ui/ai-markdown";
import { toMarkdownParagraphs } from "@/lib/ats/format-description";
import { JobStatusSelect } from "../job-status-select";
import { KanbanBoard, type KanbanApplication, type AnswerItem } from "./kanban-board";
import type { ApplicationStatus, JobStatus } from "../actions";

const STATUS_BADGE: Record<JobStatus, "accent-soft" | "neutral" | "outline"> = {
  aberta: "accent-soft",
  pausada: "neutral",
  encerrada: "outline",
};

const RESUME_SIGNED_URL_TTL_SECONDS = 60 * 60;

function buildDivulgacaoText(title: string, description: string, publicUrl: string): string {
  return `📢 Estamos contratando: ${title}\n\n${description}\n\nCandidate-se pelo link:\n${publicUrl}`;
}

export default async function VagaAdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = getSupabaseAdminClient();
  const { data: job } = await supabase
    .from("ats_job_postings")
    .select("id, title, description, requirements, slug, status, created_at")
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

  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const publicUrl = `${protocol}://${host}/vagas/${job.slug}`;
  const divulgacaoText = buildDivulgacaoText(job.title, job.description, publicUrl);

  return (
    <div>
      <Link href="/vagas-admin" className="inline-flex items-center gap-1.5 text-body-sm text-fg-muted hover:text-fg">
        <ArrowLeft className="h-3.5 w-3.5" /> Vagas
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md font-semibold text-fg">{job.title}</h1>
          <Badge variant={STATUS_BADGE[job.status as JobStatus]} className="mt-2">
            {job.status}
          </Badge>
        </div>
        <JobStatusSelect jobId={job.id} status={job.status as JobStatus} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-surface p-6">
          <h2 className="font-display text-heading-sm font-semibold text-fg">Link público</h2>
          <p className="mt-2 break-all text-body-sm text-fg-muted">{publicUrl}</p>
          <CopyButton text={publicUrl} label="Copiar link" className="mt-3" />
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-6">
          <h2 className="font-display text-heading-sm font-semibold text-fg">Texto de divulgação</h2>
          <p className="mt-2 whitespace-pre-wrap text-body-sm text-fg-muted">{divulgacaoText}</p>
          <CopyButton text={divulgacaoText} label="Copiar texto" className="mt-3" />
        </div>
      </div>

      <details className="mt-6 rounded-xl border border-border bg-bg-surface open:pb-6">
        <summary className="cursor-pointer px-6 py-4 font-display text-heading-sm font-semibold text-fg">
          Descrição, requisitos e perguntas
        </summary>
        <div className="px-6">
          <AiMarkdown content={toMarkdownParagraphs(job.description)} />
          <div className="mt-2">
            <AiMarkdown content={toMarkdownParagraphs(job.requirements)} />
          </div>
          {(questions ?? []).length > 0 && (
            <>
              <h3 className="mt-5 font-display text-heading-sm font-semibold text-fg">Perguntas para o candidato</h3>
              <ul className="mt-2 list-inside list-disc text-body-sm text-fg-muted">
                {(questions ?? []).map((q) => (
                  <li key={q.id}>{q.question}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </details>

      <div className="mt-10 flex items-center justify-between">
        <div>
          <h2 className="font-display text-heading-md font-semibold text-fg">
            Candidaturas ({kanbanApplications.length})
          </h2>
          <p className="mt-1 text-body-sm text-fg-muted">
            Mude a etapa direto no seletor do card, ou clique no card pra ver a análise completa.
          </p>
        </div>
      </div>

      {kanbanApplications.length > 0 ? (
        <div className="mt-5">
          <KanbanBoard jobId={job.id} applications={kanbanApplications} />
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-border bg-bg-surface p-8 text-center text-body-sm text-fg-muted">
          Nenhuma candidatura recebida ainda.
        </p>
      )}
    </div>
  );
}
