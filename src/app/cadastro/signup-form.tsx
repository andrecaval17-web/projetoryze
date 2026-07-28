"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { signUp, type SignupState } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: SignupState = { status: "idle" };

interface SignupFormProps {
  plan: string;
  prefillEmail?: string;
  /** Chamado quando a pessoa opta por ir pra aba de login (ex: e-mail já cadastrado). */
  onOfferLogin?: (email: string) => void;
}

export function SignupForm({ plan, prefillEmail, onOfferLogin }: SignupFormProps) {
  // signUp() sempre faz redirect() em caso de sucesso (Stripe Checkout para
  // planos pagos, /para-candidatos/painel para o Grátis) — o estado aqui só
  // é usado para mostrar erro/e-mail duplicado; um "success" nunca chega a
  // renderizar.
  const [state, formAction, isPending] = useActionState(signUp, initialState);
  const [email, setEmail] = useState(prefillEmail ?? "");

  if (state.status === "email_exists") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-accent-500/30 bg-bg-surface p-8 text-center">
        <LogIn className="h-8 w-8 text-accent-600 dark:text-accent-400" />
        <p className="text-body-md text-fg">{state.message}</p>
        <Button type="button" size="lg" onClick={() => onOfferLogin?.(state.email ?? email)}>
          Entrar com esse e-mail
        </Button>
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
      <FormField label="Senha" htmlFor="password" helperText="Mínimo de 6 caracteres" required>
        <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
      </FormField>

      <label htmlFor="terms" className="flex items-start gap-2.5 text-body-sm text-fg-muted">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-accent-600 focus-visible:outline-2 focus-visible:outline-accent-500"
        />
        <span>
          Li e concordo com os{" "}
          <Link href="/termos" target="_blank" className="font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" target="_blank" className="font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>

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
