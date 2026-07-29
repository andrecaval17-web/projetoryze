"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { submitJobOpeningRequest, type SubmitJobRequestState } from "./actions";
import type { JobRequestRow } from "@/lib/job-request-options";
import { JobRequestFields } from "@/components/ats/job-request-fields";
import { TermoCompromisso } from "@/components/ats/termo-compromisso";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const initialState: SubmitJobRequestState = { status: "idle" };

export function JobRequestForm({ token, initial }: { token: string; initial: JobRequestRow }) {
  const boundSubmit = submitJobOpeningRequest.bind(null, token);
  const [state, formAction, isPending] = useActionState(boundSubmit, initialState);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

      <TermoCompromisso />

      <Checkbox
        id="terms_accepted"
        name="terms_accepted"
        required
        checked={termsAccepted}
        onChange={(e) => setTermsAccepted(e.target.checked)}
        label="Li e concordo com o Termo de Compromisso acima."
      />

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
        <Button type="submit" size="lg" loading={isPending} disabled={!termsAccepted} className="mt-4 w-full">
          Aceitar e enviar solicitação
        </Button>
      </div>
    </form>
  );
}
