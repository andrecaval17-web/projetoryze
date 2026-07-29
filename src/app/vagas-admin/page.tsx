import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { CreateJobForm } from "./create-form";
import { JobStatusSelect } from "./job-status-select";
import type { JobStatus } from "./actions";
import type { JobRequestRow } from "@/lib/job-request-options";
import { buildDescriptionDraft, buildRequirementsDraft } from "@/lib/ats/format-job-request";

export const metadata = { title: "Vagas — Ryze" };

const STATUS_BADGE: Record<JobStatus, "accent-soft" | "neutral" | "outline"> = {
  aberta: "accent-soft",
  pausada: "neutral",
  encerrada: "outline",
};

export default async function VagasAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ fromRequest?: string }>;
}) {
  const { fromRequest } = await searchParams;
  const supabase = getSupabaseAdminClient();
  const { data: postings } = await supabase
    .from("ats_job_postings")
    .select("id, title, status, created_at, ats_applications(count)")
    .order("created_at", { ascending: false });

  // Pré-preenche o formulário de criação a partir de uma solicitação de
  // abertura de vaga já revisada (ver src/app/vagas-admin/aberturas) — só
  // se ela ainda não foi convertida (evita prefill de algo já usado).
  let prefill: { title: string; description: string; requirements: string } | undefined;
  if (fromRequest) {
    const { data: request } = await supabase
      .from("ats_job_requests")
      .select("*")
      .eq("id", fromRequest)
      .eq("status", "em_revisao")
      .maybeSingle<JobRequestRow>();

    if (request) {
      prefill = {
        title: request.job_title ?? "",
        description: buildDescriptionDraft(request),
        requirements: buildRequirementsDraft(request),
      };
    }
  }

  return (
    <div>
      <p className="text-body-sm text-fg-muted">Crie vagas e acompanhe o pipeline de candidaturas.</p>

      <div className="mt-6 rounded-xl border border-border bg-bg-surface p-6">
        <h2 className="font-display text-heading-md font-semibold text-fg">Nova vaga</h2>
        <div className="mt-4">
          <CreateJobForm initialValues={prefill} sourceRequestId={prefill ? fromRequest : undefined} />
        </div>
      </div>

      <h2 className="mt-10 font-display text-heading-md font-semibold text-fg">
        Vagas ({(postings ?? []).length})
      </h2>

      {(postings ?? []).length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-bg-surface p-8 text-center text-body-sm text-fg-muted">
          Nenhuma vaga criada ainda.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(postings ?? []).map((job) => (
            <div
              key={job.id}
              className="flex flex-col rounded-xl border border-border bg-bg-surface p-5 transition-ryze hover:border-accent-500/40"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/vagas-admin/${job.id}`} className="font-display text-heading-sm font-semibold text-fg hover:underline">
                  {job.title}
                </Link>
                <Badge variant={STATUS_BADGE[job.status as JobStatus]}>{job.status}</Badge>
              </div>

              <div className="mt-4 flex items-center gap-4 text-body-sm text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {job.ats_applications?.[0]?.count ?? 0} candidaturas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(job.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div className="mt-4">
                <JobStatusSelect jobId={job.id} status={job.status as JobStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
