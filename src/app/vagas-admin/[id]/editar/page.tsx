import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { EditJobForm, type EditableQuestion } from "./edit-form";

export const metadata = { title: "Editar vaga — Ryze" };

export default async function EditarVagaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = getSupabaseAdminClient();
  const { data: job } = await supabase
    .from("ats_job_postings")
    .select("id, title, description, requirements, slug, status")
    .eq("id", id)
    .maybeSingle();

  if (!job) {
    notFound();
  }

  // Inclui as arquivadas: elas aparecem numa seção separada, com a opção de
  // reativar. Sem isso, uma pergunta removida por engano seria irrecuperável
  // pela interface.
  const { data: questions } = await supabase
    .from("ats_job_questions")
    .select("id, question, display_order, archived_at")
    .eq("job_posting_id", id)
    .order("display_order", { ascending: true });

  // Quantos candidatos já responderam cada pergunta — usado pra avisar o
  // admin antes de ele editar o texto ou remover a pergunta.
  const questionIds = (questions ?? []).map((q) => q.id);
  const { data: answers } =
    questionIds.length > 0
      ? await supabase.from("ats_application_answers").select("question_id").in("question_id", questionIds)
      : { data: [] };

  const answerCounts = new Map<string, number>();
  for (const row of answers ?? []) {
    answerCounts.set(row.question_id, (answerCounts.get(row.question_id) ?? 0) + 1);
  }

  const { count: applicationCount } = await supabase
    .from("ats_applications")
    .select("id", { count: "exact", head: true })
    .eq("job_posting_id", id);

  const editableQuestions: EditableQuestion[] = (questions ?? []).map((q) => ({
    id: q.id,
    question: q.question,
    archived: q.archived_at !== null,
    answerCount: answerCounts.get(q.id) ?? 0,
  }));

  return (
    <div>
      <Link
        href={`/vagas-admin/${job.id}`}
        className="inline-flex items-center gap-1.5 text-body-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {job.title}
      </Link>

      <h1 className="mt-3 font-display text-display-md font-semibold text-fg">Editar vaga</h1>
      <p className="mt-1 text-body-sm text-fg-muted">
        As alterações valem imediatamente na página pública. O link da vaga (
        <span className="font-medium text-fg">/vagas/{job.slug}</span>) não muda, mesmo se você alterar o título
        — assim tudo que já foi divulgado continua funcionando.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-bg-surface p-6">
        <EditJobForm
          jobId={job.id}
          initialValues={{
            title: job.title,
            description: job.description,
            requirements: job.requirements,
          }}
          initialQuestions={editableQuestions}
          applicationCount={applicationCount ?? 0}
        />
      </div>
    </div>
  );
}
