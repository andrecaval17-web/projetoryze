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
  searchParams: Promise<{ plano?: string; intervalo?: string }>;
}) {
  const { plano = "gratis", intervalo } = await searchParams;
  const plan = getPlan(plano) ?? getPlan("gratis")!;
  const interval = intervalo === "anual" ? "year" : "month";

  return <AuthTabs initialTab="criar-conta" plan={plan} interval={interval} />;
}
