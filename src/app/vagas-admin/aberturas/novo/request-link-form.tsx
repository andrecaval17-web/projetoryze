"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, LinkIcon } from "lucide-react";
import { createJobOpeningRequest, type CreateJobRequestState } from "../actions";
import { JobRequestFields } from "@/components/ats/job-request-fields";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

const initialState: CreateJobRequestState = { status: "idle" };

export function RequestLinkForm() {
  const [state, formAction, isPending] = useActionState(createJobOpeningRequest, initialState);

  if (state.status === "success" && state.link) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-accent-500/40 bg-bg-surface p-8 text-center">
        <LinkIcon className="h-8 w-8 text-accent-600 dark:text-accent-400" />
        <p className="text-body-md text-fg">Link gerado! Envie para a empresa preencher ou confirmar os dados.</p>
        <div className="flex w-full max-w-lg items-center gap-2 rounded-md border border-border bg-bg px-3 py-2">
          <code className="flex-1 truncate text-body-sm text-fg-muted">{state.link}</code>
          <CopyButton text={state.link} />
        </div>
        <Link href="/vagas-admin/aberturas" className="text-body-sm font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormField label="Empresa" htmlFor="company_name" required>
        <Input id="company_name" name="company_name" placeholder="Ex: Embali S/A" required />
      </FormField>

      <div className="rounded-lg border-2 border-dashed border-accent-500/40 bg-accent-500/5 p-5">
        <p className="text-body-sm text-fg-muted">
          Tudo abaixo é opcional — deixe em branco pra empresa preencher do zero, ou preencha o que você já sabe:
          a empresa vê os campos prontos e só confirma ou ajusta.
        </p>
      </div>

      <JobRequestFields initial={{}} required={false} showCompanyName={false} />

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isPending}>
          <LinkIcon className="h-4 w-4" />
          Gerar link
        </Button>
        <Link
          href="/vagas-admin/aberturas"
          className="inline-flex items-center gap-1.5 text-body-sm font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Cancelar
        </Link>
      </div>
    </form>
  );
}
