"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { AlertCircle, MessageSquarePlus, Plus, X } from "lucide-react";
import { createJobPosting, type CreateJobPostingState } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initialState: CreateJobPostingState = { status: "idle" };

interface CreateJobFormProps {
  initialValues?: { title: string; description: string; requirements: string };
  /** Presente quando a vaga nasce de uma solicitação de abertura revisada — marca a solicitação como convertida e a vaga nasce "pausada" (ver actions.ts). */
  sourceRequestId?: string;
}

export function CreateJobForm({ initialValues, sourceRequestId }: CreateJobFormProps) {
  const [state, formAction, isPending] = useActionState(createJobPosting, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  // Perguntas customizadas: lista dinâmica controlada aqui (não dá pra
  // reaproveitar `formRef.current?.reset()` sozinho pra limpar isso, já
  // que são inputs adicionados/removidos em runtime). Começa com UM campo
  // já visível — antes começava vazio e a seção só ficava visível ao clicar
  // num botão pequeno, o que fazia a funcionalidade passar despercebida
  // (achado do cliente em 2026-07-24, segunda rodada).
  const [questions, setQuestions] = useState<string[]>([""]);

  useEffect(() => {
    // Sucesso não tem estado próprio (a lista abaixo já revalida e mostra a
    // vaga nova) — só limpa o formulário quando um submit termina sem erro.
    if (wasPending.current && !isPending && state.status !== "error") {
      formRef.current?.reset();
      setQuestions([""]);
    }
    wasPending.current = isPending;
  }, [isPending, state.status]);

  function addQuestion() {
    setQuestions((prev) => [...prev, ""]);
  }

  function updateQuestion(index: number, value: string) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      {sourceRequestId && <input type="hidden" name="source_request_id" value={sourceRequestId} />}
      {initialValues && (
        <p className="rounded-md bg-accent-500/10 px-4 py-3 text-body-sm text-accent-600 dark:text-accent-400">
          Pré-preenchido a partir de uma solicitação de abertura de vaga — revise o texto antes de criar. A vaga
          nasce pausada, publique quando estiver pronta.
        </p>
      )}
      <FormField label="Título da vaga" htmlFor="title" required>
        <Input id="title" name="title" placeholder="Ex: Analista de RH Pleno" defaultValue={initialValues?.title} required />
      </FormField>
      <FormField label="Descrição" htmlFor="description" required>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Sobre a vaga, responsabilidades, contexto do time..."
          defaultValue={initialValues?.description}
          required
        />
      </FormField>
      <FormField label="Requisitos" htmlFor="requirements" required helperText="Um por linha ou em texto livre — usado também pra calcular a aderência do currículo.">
        <Textarea
          id="requirements"
          name="requirements"
          rows={4}
          placeholder="Ex: Experiência com recrutamento e seleção, Excel avançado, inglês intermediário..."
          defaultValue={initialValues?.requirements}
          required
        />
      </FormField>

      <div className="rounded-xl border-2 border-dashed border-accent-500/40 bg-accent-500/5 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-ryze text-white shadow-glow-sm">
            <MessageSquarePlus className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="font-display text-body-md font-semibold text-fg">Perguntas para o candidato</p>
            <p className="text-body-sm text-fg-muted">
              Opcional — respondidas obrigatoriamente na página de candidatura. Não dá pra editar depois de criar a vaga.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {questions.map((question, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                name="questions"
                value={question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder="Ex: Por que você quer trabalhar na Ryze?"
                className="bg-bg"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(index)}
                aria-label="Remover pergunta"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="button" variant="secondary" size="sm" onClick={addQuestion} className="mt-3">
          <Plus className="h-3.5 w-3.5" />
          Adicionar outra pergunta
        </Button>
      </div>

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button type="submit" loading={isPending} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Criar vaga
      </Button>
    </form>
  );
}
