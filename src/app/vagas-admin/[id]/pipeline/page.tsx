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
    .select("id, title, content_updated_at")
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

  // Inclui perguntas arquivadas de propósito: elas saíram do formulário
  // público, mas quem respondeu antes do arquivamento continua com a resposta
  // guardada, e ela precisa aparecer aqui com o texto da pergunta.
  const { data: questions } = await supabase
    .from("ats_job_questions")
    .select("id, question, created_at, archived_at")
    .eq("job_posting_id", id)
    .order("display_order", { ascending: true });

  const applicationIds = (applications ?? []).map((app) => app.id);
  const { data: answers } =
    applicationIds.length > 0
      ? await supabase
          .from("ats_application_answers")
          .select("application_id, question_id, answer")
          .in("application_id", applicationIds)
      : { data: [] };

  const answerByApplicationQuestion = new Map<string, string>();
  for (const answer of answers ?? []) {
    answerByApplicationQuestion.set(`${answer.application_id}:${answer.question_id}`, answer.answer);
  }

  /**
   * Monta o Q&A de uma candidatura na ordem das perguntas da vaga.
   *
   * Uma pergunta sem resposta só vira uma linha ("não respondida") quando foi
   * criada DEPOIS da candidatura — é o caso de o admin ter adicionado a
   * pergunta com a vaga já no ar. Sem essa distinção, o recrutador não
   * conseguiria diferenciar "o candidato pulou" de "a pergunta nem existia
   * quando ele se candidatou", e nenhuma candidatura antiga deve parecer
   * incompleta por causa de uma edição posterior.
   */
  function buildAnswers(applicationId: string, applicationCreatedAt: string): AnswerItem[] {
    const items: AnswerItem[] = [];
    for (const q of questions ?? []) {
      const answer = answerByApplicationQuestion.get(`${applicationId}:${q.id}`);
      if (answer !== undefined) {
        items.push({ question: q.question, answer });
        continue;
      }
      // Arquivada e sem resposta: não interessa a ninguém.
      if (q.archived_at) continue;
      if (new Date(q.created_at) > new Date(applicationCreatedAt)) {
        items.push({ question: q.question, answer: null, addedAfterApplication: true });
      }
    }
    return items;
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
        answers: buildAnswers(app.id, app.created_at),
        // A nota foi calculada contra a descrição/requisitos vigentes no envio
        // (ver src/app/vagas/[slug]/actions.ts). Se o texto mudou depois, essa
        // nota e as das candidaturas novas saíram de réguas diferentes — e o
        // kanban ordena por nota.
        jobEditedAfterApplication: new Date(job.content_updated_at) > new Date(app.created_at),
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
