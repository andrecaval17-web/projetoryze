import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// O SDK do Stripe precisa do runtime Node (usa APIs de crypto não
// disponíveis no Edge runtime).
export const runtime = "nodejs";

function planFromPriceId(priceId: string | null | undefined): "impulso" | "mentoria" | null {
  if (!priceId) return null;
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_IMPULSO) return "impulso";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_IMPULSO_ANUAL) return "impulso";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MENTORIA) return "mentoria";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MENTORIA_ANUAL) return "mentoria";
  return null;
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error(
      `[stripe webhook] subscription ${subscription.id} sem metadata.supabase_user_id — ignorando`
    );
    return;
  }

  const item = subscription.items.data[0];
  const plan = planFromPriceId(item?.price?.id);
  if (!plan) {
    console.error(
      `[stripe webhook] subscription ${subscription.id} com price desconhecido (${item?.price?.id}) — ignorando`
    );
    return;
  }

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  // O próprio Stripe já diz o intervalo de cobrança do Price em uso — mais
  // confiável que tentar rededuzir a partir de qual env var bateu com o
  // Price ID (planFromPriceId só precisa saber o PLANO, não o intervalo).
  const billingInterval = item?.price?.recurring?.interval === "year" ? "year" : "month";

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      status: subscription.status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      billing_interval: billingInterval,
      current_period_end: item
        ? new Date(item.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (error) {
    console.error("[stripe webhook] falha ao gravar subscription no Supabase", error);
    throw error;
  }

  // Rede de segurança contra duas assinaturas `active` simultâneas pro mesmo
  // usuário — o caminho normal (`upgradeToPlan`) já cancela a antiga antes
  // de criar a nova, mas isso cobre qualquer outro jeito de uma segunda
  // assinatura ativa aparecer (ex: cancelamento manual pelo painel do
  // Stripe fora de ordem). `getCurrentUserPlan()` assume no máximo uma linha
  // `active` por usuário; nunca deixa duas convivendo.
  if (subscription.status === "active") {
    const { error: supersedeError } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "active")
      .neq("stripe_subscription_id", subscription.id);

    if (supersedeError) {
      console.error(
        `[stripe webhook] falha ao encerrar assinaturas antigas duplicadas do usuário ${userId}`,
        supersedeError
      );
    }
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET não configurado");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // A verificação de assinatura do Stripe exige o corpo cru (texto), nunca
  // o JSON já parseado — por isso lemos via req.text(), não req.json().
  const rawBody = await req.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] assinatura inválida", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertSubscription(subscription);
        }
        break;
      }

      // Cobre upgrade/downgrade (mudança de price) e cancelamento (status
      // vira "canceled") — ambos chegam como o mesmo formato de evento, só
      // fazemos upsert com o estado atual da assinatura em ambos os casos.
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscription(subscription);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] erro processando evento ${event.type}`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
