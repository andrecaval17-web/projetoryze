"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { submitApplication, type ApplicationState } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initialState: ApplicationState = { status: "idle" };

interface JobQuestion {
  id: string;
  question: string;
}

export function ApplyForm({
  jobPostingId,
  questions,
}: {
  jobPostingId: string;
  questions: JobQuestion[];
}) {
  const [state, formAction, isPending] = useActionState(submitApplication, initialState);

  if (state.status === "success") {
    return (
      <p className="mt-6 flex items-center gap-2 rounded-md bg-accent-500/10 px-4 py-3 text-body-sm text-accent-600 dark:text-accent-400">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Candidatura recebida! Nossa equipe vai analisar seu perfil.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-5">
      <input type="hidden" name="job_posting_id" value={jobPostingId} />

      <FormField label="Nome completo" htmlFor="name" required>
        <Input id="name" name="name" placeholder="Seu nome" required />
      </FormField>
      <FormField label="E-mail" htmlFor="email" required>
        <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
      </FormField>
      <FormField label="Telefone" htmlFor="phone" helperText="Opcional">
        <Input id="phone" name="phone" type="tel" placeholder="(00) 00000-0000" />
      </FormField>
      <FormField label="LinkedIn" htmlFor="linkedin_url" helperText="Opcional — cole o link do seu perfil">
        <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/seu-perfil" />
      </FormField>
      <FormField label="Currículo (PDF)" htmlFor="resume" required helperText="Máximo 6 MB">
        <input
          id="resume"
          name="resume"
          type="file"
          accept="application/pdf"
          required
          className="block w-full text-body-sm text-fg file:mr-4 file:rounded-md file:border-0 file:bg-bg-surface-2 file:px-4 file:py-2.5 file:text-body-sm file:font-medium file:text-fg hover:file:bg-bg-surface-2/80"
        />
      </FormField>

      {questions.map((q) => (
        <FormField key={q.id} label={q.question} htmlFor={`question-${q.id}`} required>
          <Textarea id={`question-${q.id}`} name={`question-${q.id}`} rows={3} required />
        </FormField>
      ))}

      <label htmlFor="terms" className="flex items-start gap-2.5 text-body-sm text-fg-muted">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-accent-600 focus-visible:outline-2 focus-visible:outline-accent-500"
        />
        <span>
          Ao se candidatar, você concorda com nossos{" "}
          <Link href="/termos" target="_blank" className="font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400">
            Termos de Uso
          </Link>{" "}
          e entra automaticamente no banco de talentos da Ryze, podendo ser considerado(a) para
          outras vagas futuras.
        </span>
      </label>

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Enviar candidatura
      </Button>
    </form>
  );
}
