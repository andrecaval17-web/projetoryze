"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { updatePassword, type ResetPasswordState } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: ResetPasswordState = { status: "idle" };

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-surface p-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-accent-600 dark:text-accent-400" />
        <p className="text-body-md text-fg">Senha atualizada com sucesso!</p>
        <Link
          href="/para-candidatos/painel"
          className="text-body-sm font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400"
        >
          Ir para sua área
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormField label="Nova senha" htmlFor="password" required>
        <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
      </FormField>
      <FormField label="Confirmar nova senha" htmlFor="confirmPassword" required>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
        />
      </FormField>

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Salvar nova senha
      </Button>
    </form>
  );
}
