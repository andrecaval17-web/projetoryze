"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/server";

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Abre o Customer Portal do Stripe pro candidato assinante gerenciar a
 * própria assinatura — cancelamento, forma de pagamento e histórico de
 * faturas. Deliberadamente SEM troca de plano pelo Portal: a
 * `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` (configuração restrita, ver
 * HANDOFF/README) desativa `subscription_update`, porque a troca de plano já
 * tem uma lógica própria de proração em `upgradeToPlan`
 * (src/app/para-candidatos/painel/upgrade/actions.ts) — o Portal trocando o
 * Price por conta própria reintroduziria o bug de assinatura dupla que essa
 * lógica existe pra evitar.
 */
export async function openBillingPortal() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    redirect("/para-candidatos/painel");
  }

  const baseUrl = await getBaseUrl();
  const stripe = getStripeClient();
  const configurationId = process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID;

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${baseUrl}/para-candidatos/painel`,
    ...(configurationId ? { configuration: configurationId } : {}),
  });

  redirect(session.url);
}
