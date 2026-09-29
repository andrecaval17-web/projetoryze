import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { confirmToken } from "./actions";

export const metadata: Metadata = {
  title: "Confirmar — Ryze",
  robots: { index: false, follow: false },
};

/**
 * Página intermediária dos links de e-mail que precisam virar uma sessão
 * real (hoje: redefinição de senha). Ela NÃO consome o token sozinha — só
 * mostra os dados em campos ocultos e exige um clique real em "Confirmar"
 * (ver actions.ts). Isso evita que verificadores automáticos de e-mail
 * (ex.: Microsoft Safe Links no Outlook/Hotmail, que abrem o link sozinhos
 * pra checar se é seguro) consumam o token antes da pessoa clicar.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const { token_hash, type, next } = await searchParams;
  const valido = Boolean(token_hash && type);

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>

      <div className="mt-8 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-accent-600 dark:text-accent-400" />
        <h1 className="mt-3 font-display text-display-md font-semibold text-fg">
          Confirmar solicitação
        </h1>
        <p className="mt-2 text-body-sm text-fg-muted">
          Por segurança, confirme que foi você quem pediu essa ação. Isso evita que verificadores
          automáticos de e-mail usem o link antes de você.
        </p>
      </div>

      <div className="mt-8">
        {valido ? (
          <form action={confirmToken} className="flex flex-col gap-4">
            <input type="hidden" name="token_hash" value={token_hash} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="next" value={next ?? "/"} />
            <Button type="submit" size="lg" className="w-full">
              Confirmar
            </Button>
          </form>
        ) : (
          <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Link inválido ou incompleto.
          </p>
        )}
      </div>
    </div>
  );
}
