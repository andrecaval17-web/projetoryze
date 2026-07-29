"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { submitJobOpeningRequest, type SubmitJobRequestState } from "./actions";
import type { JobRequestRow } from "@/lib/job-request-options";
import { JobRequestFields } from "@/components/ats/job-request-fields";
import { Button } from "@/components/ui/button";

const initialState: SubmitJobRequestState = { status: "idle" };

export function JobRequestForm({ token, initial }: { token: string; initial: JobRequestRow }) {
  const boundSubmit = submitJobOpeningRequest.bind(null, token);
  const [state, formAction, isPending] = useActionState(boundSubmit, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-surface p-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-accent-600 dark:text-accent-400" />
        <p className="text-body-md text-fg">
          Solicitação recebida! Nossa equipe vai revisar e dar sequência à abertura da vaga.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <JobRequestFields initial={initial} required />

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <div className="rounded-lg border border-border bg-bg-surface p-6 text-center">
        <p className="text-body-sm text-fg-muted">
          Ao clicar abaixo, você confirma que as informações preenchidas são verdadeiras e representa
          formalmente a empresa nesta solicitação de abertura de vaga — o mesmo efeito de uma assinatura.
        </p>
        <Button type="submit" size="lg" loading={isPending} className="mt-4 w-full">
          Aceitar e enviar solicitação
        </Button>
      </div>
    </form>
  );
}
