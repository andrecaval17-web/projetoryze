import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Esqueci minha senha — Ryze",
  robots: { index: false, follow: false },
};

export default async function EsqueciSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>

      <div className="mt-8 text-center">
        <h1 className="font-display text-display-md font-semibold text-fg">Esqueceu sua senha?</h1>
        <p className="mt-2 text-body-sm text-fg-muted">
          Informe seu e-mail e enviamos um link para você criar uma nova senha.
        </p>
      </div>

      {erro === "link-invalido" && (
        <p className="mt-6 flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Esse link de redefinição expirou ou já foi usado. Peça um novo abaixo.
        </p>
      )}

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
