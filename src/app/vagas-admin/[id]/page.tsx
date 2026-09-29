import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, KanbanSquare, Pencil } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { AiMarkdown } from "@/components/ui/ai-markdown";
import { toMarkdownParagraphs } from "@/lib/ats/format-description";
import { JobStatusSelect } from "../job-status-select";
import type { JobStatus } from "../actions";

const STATUS_BADGE: Record<JobStatus, "accent-soft" | "neutral" | "outline"> = {
  aberta: "accent-soft",
  pausada: "neutral",
  encerrada: "outline",
};

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
    .select("id, title, description, requirements, slug, status, created_at, ats_applications(count)")
    .eq("id", id)
    .maybeSingle();

  if (!job) {
    notFound();
  }

  const { data: questions } = await supabase
    .from("ats_job_questions")
    .select("id, question")
    .eq("job_posting_id", id)
    .is("archived_at", null)
    .order("display_order", { ascending: true });

  const applicationCount = job.ats_applications?.[0]?.count ?? 0;

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
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="secondary">
            <Link href={`/vagas-admin/${job.id}/editar`}>
              <Pencil className="h-4 w-4" />
              Editar vaga
            </Link>
          </Button>
          <JobStatusSelect jobId={job.id} status={job.status as JobStatus} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-accent-500/40 bg-accent-500/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-heading-md font-semibold text-fg">Pipeline de candidaturas</h2>
            <p className="mt-1 text-body-sm text-fg-muted">
              {applicationCount} candidatura{applicationCount === 1 ? "" : "s"} — quadro kanban por etapa, com análise de aderência.
            </p>
          </div>
          <Button asChild>
            <Link href={`/vagas-admin/${job.id}/pipeline`}>
              <KanbanSquare className="h-4 w-4" />
              Ver pipeline
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
    </div>
  );
}
