import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar — Ryze",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>

      <div className="mt-8 text-center">
        <h1 className="font-display text-display-md font-semibold text-fg">Entrar na sua conta</h1>
        <p className="mt-2 text-body-sm text-fg-muted">Acesse seu currículo, vagas e planos.</p>
      </div>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-body-sm text-fg-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro?plano=gratis" className="font-medium text-accent-600 dark:text-accent-400">
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}
