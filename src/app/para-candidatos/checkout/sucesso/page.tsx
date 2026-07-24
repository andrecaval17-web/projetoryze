import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getStripeClient } from "@/lib/stripe/server";

export const metadata: Metadata = {
  title: "Assinatura confirmada — Ryze",
  robots: { index: false, follow: false },
};

export default async function CheckoutSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let paid = false;
  let planName: string | null = null;

  if (session_id) {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      paid = session.payment_status === "paid" || session.status === "complete";
      planName = (session.metadata?.plan as string) ?? null;
    } catch (err) {
      console.error("Failed to verify checkout session", err);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-20 text-center">
      <Link href="/" aria-label="Ryze — início">
        <Logo size="md" />
      </Link>

      {paid ? (
        <>
          <CheckCircle2 className="mt-8 h-12 w-12 text-accent-500" />
          <h1 className="mt-4 font-display text-display-md font-semibold text-fg">
            Assinatura confirmada!
          </h1>
          <p className="mt-3 text-body-md text-fg-muted">
            {planName === "mentoria"
              ? "Bem-vindo à Mentoria. Em breve você recebe o convite para agendar sua primeira sessão."
              : "Bem-vindo ao Impulso. Seu acesso às ferramentas de IA está sendo liberado."}
          </p>
        </>
      ) : (
        <>
          <XCircle className="mt-8 h-12 w-12 text-fg-muted" />
          <h1 className="mt-4 font-display text-display-md font-semibold text-fg">
            Não conseguimos confirmar o pagamento
          </h1>
          <p className="mt-3 text-body-md text-fg-muted">
            Se você concluiu o pagamento, pode levar alguns instantes para
            confirmarmos. Se cancelou, sem problema — você pode tentar de novo
            quando quiser.
          </p>
        </>
      )}

      <Button asChild size="lg" className="mt-8">
        <Link href="/para-candidatos/painel">Ir para sua área</Link>
      </Button>
    </div>
  );
}
