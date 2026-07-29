import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  jobStatusLabel,
  experienceTimeLabel,
  educationLevelLabel,
  type JobRequestRow,
} from "@/lib/job-request-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ArchiveButton } from "./archive-button";

export const metadata: Metadata = { title: "Solicitação de Abertura de Vaga — Ryze" };

const STATUS_LABEL: Record<JobRequestRow["status"], string> = {
  pendente: "Aguardando empresa",
  em_revisao: "Recebida — revisar",
  convertida: "Convertida em vaga",
  arquivada: "Arquivada",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-caption font-medium uppercase tracking-wide text-fg-muted">{label}</dt>
      <dd className="mt-1 text-body-md text-fg">{value || "—"}</dd>
    </div>
  );
}

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function AberturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdminClient();

  const { data: request } = await supabase
    .from("ats_job_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle<JobRequestRow>();

  if (!request) {
    notFound();
  }

  const baseUrl = await getBaseUrl();
  const link = `${baseUrl}/abertura-de-vaga/${request.token}`;

  return (
    <div>
      <Link
        href="/vagas-admin/aberturas"
        className="inline-flex items-center gap-1.5 text-body-sm font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg font-semibold text-fg">{request.company_name}</h1>
          <p className="mt-1 text-body-sm text-fg-muted">{request.job_title || "Cargo ainda não informado"}</p>
        </div>
        <Badge variant={request.status === "convertida" ? "accent-soft" : "neutral"}>
          {STATUS_LABEL[request.status]}
        </Badge>
      </div>

      {!request.submitted_at && (
        <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-bg-surface px-4 py-3">
          <code className="flex-1 truncate text-body-sm text-fg-muted">{link}</code>
          <CopyButton text={link} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {request.status !== "convertida" && request.status !== "arquivada" && request.submitted_at && (
          <Button asChild>
            <Link href={`/vagas-admin?fromRequest=${request.id}`}>
              Criar vaga a partir desta solicitação <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {request.status === "convertida" && request.converted_job_posting_id && (
          <Button asChild variant="secondary">
            <Link href={`/vagas-admin/${request.converted_job_posting_id}`}>Ver vaga criada</Link>
          </Button>
        )}
        {request.status !== "convertida" && request.status !== "arquivada" && (
          <ArchiveButton requestId={request.id} />
        )}
      </div>

      {!request.submitted_at ? (
        <p className="mt-8 rounded-xl border border-border bg-bg-surface p-8 text-center text-body-sm text-fg-muted">
          A empresa ainda não preencheu ou confirmou esta solicitação.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <section className="rounded-xl border border-border bg-bg-surface p-6">
            <h2 className="font-display text-heading-sm font-semibold text-fg">Dados do solicitante</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nome" value={request.requester_name} />
              <Field label="Cargo" value={request.requester_role} />
              <Field label="Setor" value={request.requester_department} />
              <Field label="Superior imediato" value={request.requester_manager} />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-bg-surface p-6">
            <h2 className="font-display text-heading-sm font-semibold text-fg">Dados da vaga</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Cargo buscado" value={request.job_title} />
              <Field label="Situação" value={jobStatusLabel(request.job_status)} />
              <Field label="Composição salarial" value={request.salary_composition} />
              <Field label="Horário de trabalho" value={request.work_schedule} />
              <Field label="Benefícios" value={request.benefits} />
              <Field label="Premiação" value={request.bonus} />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-bg-surface p-6">
            <h2 className="font-display text-heading-sm font-semibold text-fg">Avaliação do candidato buscado</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Exige experiência" value={request.requires_experience ? "Sim" : "Não"} />
              <Field label="Tempo de experiência" value={experienceTimeLabel(request.experience_time)} />
              <Field label="Vaga para PCD" value={request.requires_pcd ? "Sim" : "Não"} />
              <Field label="Formação acadêmica" value={educationLevelLabel(request.education_level)} />
              <Field label="Observações (formação)" value={request.education_notes} />
              <Field label="Conhecimento técnico" value={request.technical_knowledge} />
              <Field label="Conhecimento em informática" value={request.computer_skills} />
            </dl>
            <div className="mt-4">
              <dt className="text-caption font-medium uppercase tracking-wide text-fg-muted">
                Perfil comportamental
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {request.behavioral_traits.length > 0
                  ? request.behavioral_traits.map((trait) => (
                      <Badge key={trait} variant="neutral">
                        {trait}
                      </Badge>
                    ))
                  : "—"}
              </dd>
            </div>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Particularidade da vaga" value={request.particularities} />
              <Field label="Diferencial desejado" value={request.candidate_differential} />
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
