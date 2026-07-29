import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Calendar, Building2 } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobRequestRow } from "@/lib/job-request-options";

export const metadata: Metadata = { title: "Aberturas de Vaga — Ryze" };

const STATUS_LABEL: Record<JobRequestRow["status"], string> = {
  pendente: "Aguardando empresa",
  em_revisao: "Recebida — revisar",
  convertida: "Convertida em vaga",
  arquivada: "Arquivada",
};

const STATUS_BADGE: Record<JobRequestRow["status"], "accent-soft" | "neutral" | "accent" | "outline"> = {
  pendente: "neutral",
  em_revisao: "accent",
  convertida: "accent-soft",
  arquivada: "outline",
};

export default async function AberturasPage() {
  const supabase = getSupabaseAdminClient();
  const { data: requests } = await supabase
    .from("ats_job_requests")
    .select("id, company_name, job_title, status, created_at")
    .order("created_at", { ascending: false });

  const rows = (requests ?? []) as Pick<JobRequestRow, "id" | "company_name" | "job_title" | "status" | "created_at">[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg font-semibold text-fg">Aberturas de Vaga</h1>
          <p className="mt-1 text-body-sm text-fg-muted">
            Links enviados a empresas clientes pra abrir uma posição via recrutamento Ryze.
          </p>
        </div>
        <Button asChild>
          <Link href="/vagas-admin/aberturas/novo">
            <Plus className="h-4 w-4" />
            Gerar link
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-border bg-bg-surface p-8 text-center text-body-sm text-fg-muted">
          Nenhuma solicitação ainda.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((req) => (
            <Link
              key={req.id}
              href={`/vagas-admin/aberturas/${req.id}`}
              className="flex flex-col rounded-xl border border-border bg-bg-surface p-5 transition-ryze hover:border-accent-500/40"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-display text-heading-sm font-semibold text-fg">
                  <Building2 className="h-4 w-4 text-fg-muted" />
                  {req.company_name}
                </span>
                <Badge variant={STATUS_BADGE[req.status]}>{STATUS_LABEL[req.status]}</Badge>
              </div>
              <p className="mt-2 text-body-sm text-fg-muted">{req.job_title || "Cargo ainda não informado"}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-body-sm text-fg-muted">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(req.created_at).toLocaleDateString("pt-BR")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
