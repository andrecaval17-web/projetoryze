"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, UserPlus } from "lucide-react";
import { signIn, type LoginState } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: LoginState = { status: "idle" };

interface LoginFormProps {
  prefillEmail?: string;
  /** Chamado quando a pessoa opta por ir pra aba de criar conta a partir de um erro de login. */
  onOfferSignup?: (email: string) => void;
}

export function LoginForm({ prefillEmail, onOfferSignup }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const [email, setEmail] = useState(prefillEmail ?? "");

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
      <FormField label="E-mail" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>
      <FormField label="Senha" htmlFor="password" required>
        <Input id="password" name="password" type="password" placeholder="••••••••" required />
      </FormField>

      <Link
        href="/esqueci-senha"
        className="-mt-2.5 self-end text-body-sm text-accent-600 underline underline-offset-2 dark:text-accent-400"
      >
        Esqueci minha senha
      </Link>

      {state.status === "error" && (
        <div className="flex flex-col gap-2.5 rounded-md bg-error/10 px-4 py-3">
          <p className="flex items-center gap-2 text-body-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.message}
          </p>
          {/* Não afirma se a conta existe ou não (evita vazar quais e-mails
              estão cadastrados) — só oferece o caminho alternativo, útil nos
              dois casos (senha errada ou conta inexistente). */}
          <button
            type="button"
            onClick={() => onOfferSignup?.(email)}
            className="flex items-center gap-1.5 self-start text-body-sm font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Ainda não tem conta? Criar conta com esse e-mail
          </button>
        </div>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
