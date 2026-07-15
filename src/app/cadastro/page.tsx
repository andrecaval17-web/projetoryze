import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { getPlan } from "@/lib/plans";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Criar conta — Ryze",
  robots: { index: false, follow: false },
};

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const { plano = "gratis" } = await searchParams;
  const plan = getPlan(plano) ?? getPlan("gratis")!;

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>

      <div className="mt-8 text-center">
        <h1 className="font-display text-display-md font-semibold text-fg">Criar sua conta</h1>
        <p className="mt-2 flex items-center justify-center gap-2 text-body-sm text-fg-muted">
          Plano selecionado:
          <Badge variant={plan.recommended ? "recommended" : "neutral"}>
            {plan.name}
            {plan.period ? ` · ${plan.price}${plan.period}` : plan.priceCents === 0 ? " · grátis" : ""}
          </Badge>
        </p>
      </div>

      <div className="mt-8">
        <SignupForm plan={plan.slug} />
      </div>

      <p className="mt-6 text-center text-body-sm text-fg-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-accent-600 dark:text-accent-400">
          Entrar
        </Link>
      </p>
    </div>
  );
}
