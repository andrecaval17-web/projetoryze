import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { JobRequestRow } from "@/lib/job-request-options";
import { JobRequestForm } from "./request-form";

export const metadata: Metadata = {
  title: "Abertura de Vaga — Ryze",
  robots: { index: false, follow: false },
};

export default async function AberturaDeVagaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = getSupabaseAdminClient();

  const { data: request } = await supabase
    .from("ats_job_requests")
    .select("*")
    .eq("token", token)
    .maybeSingle<JobRequestRow>();

  if (!request) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>

      <div className="mt-8 text-center">
        <h1 className="font-display text-display-md font-semibold text-fg">Abertura de Vaga</h1>
        <p className="mt-2 text-body-sm text-fg-muted">
          Preencha (ou confirme) os dados abaixo para abrirmos o processo seletivo.
        </p>
      </div>

      {request.submitted_at ? (
        <div className="mt-8 rounded-lg border border-border bg-bg-surface p-8 text-center">
          <p className="text-body-md text-fg">
            Esta solicitação já foi enviada em {new Date(request.submitted_at).toLocaleDateString("pt-BR")}. Se
            precisar abrir outra vaga, peça um novo link à sua consultora Ryze.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <JobRequestForm token={token} initial={request} />
        </div>
      )}
    </div>
  );
}
