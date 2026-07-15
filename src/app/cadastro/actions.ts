"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/server";
import { getPlan } from "@/lib/plans";

export interface SignupState {
  status: "idle" | "success" | "error";
  message?: string;
}

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signUp(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const planSlug = String(formData.get("plan") || "gratis");

  if (!name || !email || password.length < 6) {
    return {
      status: "error",
      message: "Preencha nome, e-mail e uma senha de pelo menos 6 caracteres.",
    };
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, plan: planSlug } },
    });
    if (error) throw error;
  } catch (err) {
    console.error("Signup failed", err);
    return {
      status: "error",
      message:
        "Não foi possível criar a conta agora. Tente novamente em instantes.",
    };
  }

  const plan = getPlan(planSlug);
  const isPaid = (plan?.priceCents ?? 0) > 0;

  // Plano pago: manda direto para o Checkout hospedado do Stripe. A conta
  // Supabase já foi criada acima; o plano ativo é liberado quando o webhook
  // (checkout.session.completed) confirmar o pagamento — isso ainda falta
  // ser implementado, é o próximo passo depois deste checkout funcionar.
  let checkoutUrl: string | null = null;

  if (isPaid && plan?.stripePriceEnv) {
    const priceId = process.env[plan.stripePriceEnv];

    if (!priceId) {
      console.error(`Missing env var ${plan.stripePriceEnv} for plan ${planSlug}`);
      return {
        status: "error",
        message: "Conta criada, mas o pagamento não está disponível agora. Fale com a gente.",
      };
    }

    try {
      const stripe = getStripeClient();
      const baseUrl = await getBaseUrl();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: email,
        success_url: `${baseUrl}/para-candidatos/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cadastro?plano=${planSlug}`,
        metadata: { plan: planSlug, name },
      });
      checkoutUrl = session.url;
    } catch (err) {
      console.error("Stripe checkout session failed", err);
      return {
        status: "error",
        message:
          "Conta criada, mas não foi possível iniciar o pagamento agora. Tente novamente.",
      };
    }
  }

  // redirect() precisa ficar fora do try/catch: ele lança um erro especial
  // que o Next.js usa para navegar, e um catch aqui o engoliria por engano.
  if (checkoutUrl) {
    redirect(checkoutUrl);
  }

  return {
    status: "success",
    message: "Conta criada! Em breve você recebe o acesso ao currículo com IA e ao grupo de vagas.",
  };
}
