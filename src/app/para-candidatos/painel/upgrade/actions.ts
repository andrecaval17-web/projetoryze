"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/server";
import { getPlan, getStripePriceEnv, type BillingInterval } from "@/lib/plans";

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Checkout de upgrade pra quem já tem conta e está logado — diferente de
 * `cadastro/actions.ts` (que cria a conta do zero), aqui só criamos a
 * sessão do Stripe pro usuário já existente. O webhook (`/api/webhooks/
 * stripe`) não distingue a origem: ele só olha `metadata.supabase_user_id`,
 * então funciona igual pros dois fluxos sem nenhuma mudança lá.
 *
 * Antes de criar a nova assinatura, cancela qualquer assinatura ativa que o
 * candidato já tenha (ex: upgrade Impulso -> Mentoria). Sem isso, a antiga
 * continua cobrando em paralelo com a nova — bug real encontrado e corrigido
 * em 2026-07-19 (candidato ficava pagando as duas ao mesmo tempo, e o painel
 * regredia pra "Grátis" porque `getCurrentUserPlan()` não esperava duas
 * linhas `active`).
 *
 * Política de proração escolhida: cancelamento IMEDIATO (nunca duas
 * assinaturas ativas ao mesmo tempo) + crédito proporcional pelo tempo não
 * usado, aplicado como saldo de crédito no Customer (`createBalanceTransaction`),
 * não pelos parâmetros `prorate`/`invoice_now` do cancelamento. Motivo: testado
 * primeiro com `prorate`/`invoice_now` — o item de crédito gerado fica
 * amarrado à assinatura ANTIGA (cancelada) e só entraria numa fatura futura
 * dela, que nunca mais existe; a fatura da assinatura NOVA (criada a seguir)
 * sai cheia, sem aplicar o crédito. Saldo de crédito no Customer não tem essa
 * amarração — é aplicado automaticamente na próxima fatura de qualquer
 * assinatura desse Customer. Por isso a nova sessão de checkout também
 * reaproveita o `stripe_customer_id` da assinatura antiga (em vez de deixar
 * o Checkout criar um Customer novo a partir de `customer_email`): o crédito
 * só se aplica automaticamente dentro do mesmo Customer.
 */
export async function upgradeToPlan(formData: FormData) {
  const planSlug = String(formData.get("plan") || "");
  const plan = getPlan(planSlug);
  const acceptedTerms = formData.get("acceptedTerms") === "on";
  const intervalRaw = String(formData.get("interval") || "month");
  const interval: BillingInterval = intervalRaw === "year" ? "year" : "month";

  if (!plan || !plan.stripePriceEnv) {
    redirect("/para-candidatos/painel/upgrade");
  }

  // O checkbox já é `required` no HTML, mas o servidor nunca confia só na
  // validação do client — ver mesmo padrão em cadastro/actions.ts.
  if (!acceptedTerms) {
    redirect("/para-candidatos/painel/upgrade");
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const priceEnv = getStripePriceEnv(plan, interval);
  const priceId = priceEnv ? process.env[priceEnv] : undefined;
  if (!priceId) {
    console.error(`Missing env var ${priceEnv} for plan ${planSlug} (${interval})`);
    redirect("/para-candidatos/painel/upgrade");
  }

  const stripe = getStripeClient();

  const { data: activeSubscriptions, error: activeSubsError } = await supabase
    .from("subscriptions")
    .select("id, stripe_customer_id, stripe_subscription_id")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (activeSubsError) {
    console.error("[upgradeToPlan] falha ao consultar assinaturas ativas existentes", activeSubsError);
  }

  let existingCustomerId: string | null = null;

  if (activeSubscriptions && activeSubscriptions.length > 0) {
    // service_role: a policy de `subscriptions` só permite leitura pro
    // próprio usuário — marcar a linha antiga como cancelada é escrita, que
    // é reservada ao webhook/service role (ver comentário na migration).
    const supabaseAdmin = getSupabaseAdminClient();

    for (const sub of activeSubscriptions) {
      existingCustomerId = sub.stripe_customer_id;

      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
        const item = stripeSubscription.items.data[0];

        await stripe.subscriptions.cancel(sub.stripe_subscription_id);

        if (item?.price.unit_amount) {
          const now = Date.now() / 1000;
          const totalPeriodSecs = item.current_period_end - item.current_period_start;
          const unusedSecs = Math.max(0, item.current_period_end - now);
          const unusedRatio = totalPeriodSecs > 0 ? unusedSecs / totalPeriodSecs : 0;
          const creditCents = Math.round(unusedRatio * item.price.unit_amount);

          if (creditCents > 0) {
            await stripe.customers.createBalanceTransaction(sub.stripe_customer_id, {
              amount: -creditCents,
              currency: item.price.currency,
              description: `Crédito pelo tempo não usado do plano anterior (cancelado por upgrade)`,
            });
          }
        }
      } catch (err) {
        // Já pode estar cancelada do lado do Stripe (ex: tentativa anterior
        // que falhou depois de cancelar mas antes de redirecionar) — não
        // bloqueia o upgrade por causa disso, só registra pra investigar.
        console.error(
          `[upgradeToPlan] falha ao cancelar assinatura antiga ${sub.stripe_subscription_id} no Stripe`,
          err
        );
      }

      // Atualiza a linha local na hora, sem esperar o webhook do Stripe —
      // fecha a janela onde as duas ficariam "active" ao mesmo tempo caso o
      // evento de cancelamento demore ou chegue fora de ordem.
      const { error: cancelRowError } = await supabaseAdmin
        .from("subscriptions")
        .update({ status: "canceled", cancel_at_period_end: false, updated_at: new Date().toISOString() })
        .eq("id", sub.id);

      if (cancelRowError) {
        console.error(`[upgradeToPlan] falha ao marcar assinatura ${sub.id} como cancelada`, cancelRowError);
      }
    }
  }

  const baseUrl = await getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    // Reaproveita o Customer existente (se houver) pra manter o crédito de
    // proração e o histórico de cobrança num único Customer no Stripe —
    // `customer_email` sozinho faria o Checkout criar um Customer novo a
    // cada upgrade.
    ...(existingCustomerId ? { customer: existingCustomerId } : { customer_email: user.email }),
    success_url: `${baseUrl}/para-candidatos/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/para-candidatos/painel/upgrade`,
    client_reference_id: user.id,
    metadata: { plan: planSlug, supabase_user_id: user.id },
    subscription_data: {
      metadata: { plan: planSlug, supabase_user_id: user.id },
    },
  });

  if (!session.url) {
    redirect("/para-candidatos/painel/upgrade");
  }

  redirect(session.url);
}
