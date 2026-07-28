"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: ForgotPasswordState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-surface p-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-accent-600 dark:text-accent-400" />
        <p className="text-body-md text-fg">
          Se esse e-mail tiver uma conta na Ryze, enviamos um link para redefinir a senha. Confira sua
          caixa de entrada (e o spam).
        </p>
        <Link
          href="/login"
          className="text-body-sm font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormField label="E-mail" htmlFor="email" required>
        <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
      </FormField>

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Enviar link de redefinição
      </Button>

      <Link
        href="/login"
        className="text-center text-body-sm text-fg-muted underline underline-offset-2 hover:text-fg"
      >
        Voltar para o login
      </Link>
    </form>
  );
}
