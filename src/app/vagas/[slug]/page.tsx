import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AiMarkdown } from "@/components/ui/ai-markdown";
import { toMarkdownParagraphs } from "@/lib/ats/format-description";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ApplyForm } from "./apply-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: job } = await supabase
    .from("ats_job_postings")
    .select("title")
    .eq("slug", slug)
    .maybeSingle();

  return {
    title: job ? `${job.title} — Vagas Ryze` : "Vaga — Ryze",
    robots: { index: false, follow: false },
  };
}

export default async function VagaPublicaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await getSupabaseServerClient();
  const { data: job } = await supabase
    .from("ats_job_postings")
    .select("id, title, description, requirements, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!job) {
    notFound();
  }

  // Só as ativas: pergunta arquivada pelo admin some do formulário sem levar
  // junto as respostas de quem já se candidatou (ver 0024_ats_job_editing.sql).
  const { data: questions } = await supabase
    .from("ats_job_questions")
    .select("id, question")
    .eq("job_posting_id", job.id)
    .is("archived_at", null)
    .order("display_order", { ascending: true });

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>

      <h1 className="mt-8 text-center font-display text-display-md font-semibold text-fg">
        {job.title}
      </h1>

      {job.status !== "aberta" ? (
        <div className="mt-8 rounded-lg border border-border bg-bg-surface p-8 text-center">
          <p className="text-body-md text-fg">
            {job.status === "pausada"
              ? "Esta vaga está temporariamente pausada e não está recebendo candidaturas no momento."
              : "Esta vaga já foi encerrada e não está mais recebendo candidaturas."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 rounded-lg border border-border bg-bg-surface p-6">
            <h2 className="font-display text-heading-sm font-semibold text-fg">Sobre a vaga</h2>
            <div className="mt-2">
              <AiMarkdown content={toMarkdownParagraphs(job.description)} />
            </div>
            <h2 className="mt-5 font-display text-heading-sm font-semibold text-fg">Requisitos</h2>
            <div className="mt-2">
              <AiMarkdown content={toMarkdownParagraphs(job.requirements)} />
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-bg-surface p-6 sm:p-8">
            <h2 className="font-display text-heading-md font-semibold text-fg">Candidate-se</h2>
            <ApplyForm jobPostingId={job.id} questions={questions ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
