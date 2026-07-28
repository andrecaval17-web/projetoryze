import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha — Ryze",
  robots: { index: false, follow: false },
};

export default async function RedefinirSenhaPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>

      <div className="mt-8 text-center">
        <h1 className="font-display text-display-md font-semibold text-fg">Definir nova senha</h1>
        <p className="mt-2 text-body-sm text-fg-muted">
          {user
            ? "Escolha uma nova senha para sua conta."
            : "Esse link expirou ou já foi usado. Peça um novo link de redefinição."}
        </p>
      </div>

      <div className="mt-8">
        {user ? (
          <ResetPasswordForm />
        ) : (
          <Link
            href="/esqueci-senha"
            className="mx-auto block w-fit text-body-sm font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400"
          >
            Pedir novo link
          </Link>
        )}
      </div>
    </div>
  );
}
