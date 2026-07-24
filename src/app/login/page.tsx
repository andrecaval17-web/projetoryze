import type { Metadata } from "next";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { getPlan } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Entrar — Ryze",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthTabs initialTab="entrar" plan={getPlan("gratis")!} />;
}
