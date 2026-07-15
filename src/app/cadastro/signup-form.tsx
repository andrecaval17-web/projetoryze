"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { signUp, type SignupState } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: SignupState = { status: "idle" };

export function SignupForm({ plan }: { plan: string }) {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-surface p-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-accent-600 dark:text-accent-400" />
        <p className="text-body-md text-fg">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="plan" value={plan} />
      <FormField label="Nome completo" htmlFor="name" required>
        <Input id="name" name="name" placeholder="Seu nome" required />
      </FormField>
      <FormField label="E-mail" htmlFor="email" required>
        <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
      </FormField>
      <FormField label="Senha" htmlFor="password" helperText="Mínimo de 6 caracteres" required>
        <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
      </FormField>

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Criar minha conta
      </Button>
    </form>
  );
}
