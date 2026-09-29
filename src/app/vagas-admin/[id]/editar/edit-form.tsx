"use client";

import { useActionState, useMemo, useState } from "react";
import { AlertCircle, Archive, CheckCircle2, Info, MessageSquarePlus, Plus, RotateCcw, Save, X } from "lucide-react";
import { updateJobPosting, type UpdateJobPostingState } from "../../actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initialState: UpdateJobPostingState = { status: "idle" };

export interface EditableQuestion {
  id: string;
  question: string;
  archived: boolean;
  answerCount: number;
}

/** Mesma coisa em memória, mas pergunta nova ainda não tem `id` do banco. */
interface QuestionRow {
  /** Chave estável de React — o `id` do banco, ou um id local pra linha nova. */
  key: string;
  id?: string;
  question: string;
  archived: boolean;
  answerCount: number;
}

export function EditJobForm({
  jobId,
  initialValues,
  initialQuestions,
  applicationCount,
}: {
  jobId: string;
  initialValues: { title: string; description: string; requirements: string };
  initialQuestions: EditableQuestion[];
  applicationCount: number;
}) {
  const [state, formAction, isPending] = useActionState(updateJobPosting, initialState);
  const [questions, setQuestions] = useState<QuestionRow[]>(() =>
    initialQuestions.map((q) => ({ key: q.id, ...q }))
  );

  // Ressincroniza com o que o servidor gravou. Sem isto, uma pergunta criada
  // agora continuaria sem `id` no estado local e o próximo "Salvar" a
  // inseriria de novo (duplicata), além de "Reativar" sumir de uma pergunta
  // que acabou de ser arquivada.
  //
  // Ajuste durante o render, não em `useEffect`: React reexecuta o componente
  // na hora, sem chegar a pintar a lista velha na tela. `state` só troca de
  // identidade quando a Server Action devolve um resultado novo.
  const [appliedResult, setAppliedResult] = useState(state);
  if (state !== appliedResult) {
    setAppliedResult(state);
    if (state.questions) {
      setQuestions(state.questions.map((q) => ({ key: q.id, ...q })));
    }
  }

  const active = questions.filter((q) => !q.archived);
  const archived = questions.filter((q) => q.archived);

  // O payload precisa estar sempre atualizado no input escondido — é ele que
  // a Server Action lê (a lista é dinâmica demais pra virar campos soltos).
  const payload = useMemo(
    () => JSON.stringify(questions.map((q) => ({ id: q.id, question: q.question, archived: q.archived }))),
    [questions]
  );

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { key: crypto.randomUUID(), question: "", archived: false, answerCount: 0 },
    ]);
  }

  function updateQuestion(key: string, value: string) {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, question: value } : q)));
  }

  function removeQuestion(key: string) {
    setQuestions((prev) => {
      const target = prev.find((q) => q.key === key);
      // Pergunta já respondida não sai da lista: vai pro arquivo, pra deixar
      // explícito que as respostas continuam guardadas.
      if (target && target.answerCount > 0) {
        return prev.map((q) => (q.key === key ? { ...q, archived: true } : q));
      }
      return prev.filter((q) => q.key !== key);
    });
  }

  function restoreQuestion(key: string) {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, archived: false } : q)));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="job_id" value={jobId} />
      <input type="hidden" name="questions_payload" value={payload} />

      {applicationCount > 0 && (
        <p className="flex items-start gap-2 rounded-md bg-bg-surface-2 px-4 py-3 text-body-sm text-fg-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Esta vaga já tem {applicationCount} candidatura{applicationCount === 1 ? "" : "s"}. Alterar descrição ou
            requisitos não recalcula a nota de aderência de quem já se candidatou — o pipeline passa a sinalizar
            esses casos. Perguntas novas valem só para quem se candidatar a partir de agora.
          </span>
        </p>
      )}

      <FormField label="Título da vaga" htmlFor="title" required helperText="O link público não muda ao editar o título.">
        <Input id="title" name="title" defaultValue={initialValues.title} required />
      </FormField>
      <FormField label="Descrição" htmlFor="description" required>
        <Textarea id="description" name="description" rows={6} defaultValue={initialValues.description} required />
      </FormField>
      <FormField
        label="Requisitos"
        htmlFor="requirements"
        required
        helperText="Um por linha ou em texto livre — usado também pra calcular a aderência do currículo."
      >
        <Textarea id="requirements" name="requirements" rows={6} defaultValue={initialValues.requirements} required />
      </FormField>

      <div className="rounded-xl border-2 border-dashed border-accent-500/40 bg-accent-500/5 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-ryze text-white shadow-glow-sm">
            <MessageSquarePlus className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="font-display text-body-md font-semibold text-fg">Perguntas para o candidato</p>
            <p className="text-body-sm text-fg-muted">
              Respondidas obrigatoriamente na página de candidatura. Pode adicionar e remover mesmo com a vaga já
              divulgada.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {active.map((q) => (
            <div key={q.key}>
              <div className="flex items-center gap-2">
                <Input
                  name={`question-input-${q.key}`}
                  value={q.question}
                  onChange={(e) => updateQuestion(q.key, e.target.value)}
                  placeholder="Ex: Por que você quer trabalhar na Ryze?"
                  className="bg-bg"
                  aria-label="Texto da pergunta"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(q.key)}
                  aria-label="Remover pergunta"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              {q.answerCount > 0 && (
                <p className="mt-1 pl-1 text-caption text-fg-muted">
                  {q.answerCount} candidato{q.answerCount === 1 ? " já respondeu" : "s já responderam"} esta pergunta —
                  editar o texto muda como a resposta dele{q.answerCount === 1 ? "" : "s"} aparece no pipeline. Ao
                  remover, as respostas são preservadas.
                </p>
              )}
            </div>
          ))}

          {active.length === 0 && (
            <p className="text-body-sm text-fg-muted">Nenhuma pergunta ativa nesta vaga.</p>
          )}
        </div>

        <Button type="button" variant="secondary" size="sm" onClick={addQuestion} className="mt-3">
          <Plus className="h-3.5 w-3.5" />
          Adicionar outra pergunta
        </Button>

        {archived.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="flex items-center gap-1.5 text-body-sm font-medium text-fg">
              <Archive className="h-3.5 w-3.5" />
              Perguntas removidas
            </p>
            <p className="mt-1 text-caption text-fg-muted">
              Não aparecem mais no formulário público, mas as respostas já recebidas continuam visíveis no pipeline.
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {archived.map((q) => (
                <li key={q.key} className="flex items-center justify-between gap-2 rounded-md bg-bg px-3 py-2">
                  <span className="text-body-sm text-fg-muted line-through">{q.question}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => restoreQuestion(q.key)}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reativar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="flex items-center gap-2 rounded-md bg-accent-500/10 px-4 py-3 text-body-sm text-accent-600 dark:text-accent-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Alterações salvas — a página pública da vaga já está atualizada.
        </p>
      )}

      <Button type="submit" loading={isPending} className="w-full sm:w-auto">
        <Save className="h-4 w-4" />
        Salvar alterações
      </Button>
    </form>
  );
}
