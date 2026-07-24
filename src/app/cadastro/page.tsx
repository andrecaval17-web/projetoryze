import type { Metadata } from "next";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { getPlan } from "@/lib/plans";

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

  return <AuthTabs initialTab="criar-conta" plan={plan} />;
}
