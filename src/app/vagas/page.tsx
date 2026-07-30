import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Vagas abertas — Ryze",
  description: "Confira as vagas abertas no momento e candidate-se em poucos minutos.",
};

// Resumo curto pro card da listagem — a descrição completa (com formatação
// livre) só aparece na página de detalhe (`/vagas/[slug]`).
function excerpt(text: string, max = 160): string {
  const flat = text.replace(/\r?\n+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max).trimEnd()}…`;
}

export default async function VagasPublicasPage() {
  const supabase = await getSupabaseServerClient();
  const { data: jobs } = await supabase
    .from("ats_job_postings")
    .select("slug, title, description, created_at")
    .eq("status", "aberta")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>

      <h1 className="mt-8 text-center font-display text-display-md font-semibold text-fg">
        Vagas abertas
      </h1>
      <p className="mt-2 text-center text-body-md text-fg-muted">
        Candidate-se diretamente, sem cadastro obrigatório.
      </p>

      {!jobs || jobs.length === 0 ? (
        <div className="mt-10 rounded-lg border border-border bg-bg-surface p-8 text-center">
          <p className="text-body-md text-fg-muted">
            Nenhuma vaga aberta no momento. Volte em breve.
          </p>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {jobs.map((job) => (
            <li key={job.slug}>
              <Link
                href={`/vagas/${job.slug}`}
                className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-bg-surface p-6 transition-ryze hover:border-accent-500/40"
              >
                <div>
                  <h2 className="font-display text-heading-sm font-semibold text-fg">
                    {job.title}
                  </h2>
                  <p className="mt-1 text-body-sm text-fg-muted">{excerpt(job.description)}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-fg-muted transition-ryze group-hover:translate-x-0.5 group-hover:text-accent-600 dark:group-hover:text-accent-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
