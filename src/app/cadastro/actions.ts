"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/server";
import { getPlan } from "@/lib/plans";

export interface SignupState {
  status: "idle" | "success" | "error" | "email_exists";
  message?: string;
  /** Só preenchido em `email_exists` — usado pra pré-preencher a aba de login. */
  email?: string;
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
  const acceptedTerms = formData.get("terms") === "on";

  if (!name || !email || password.length < 6) {
    return {
      status: "error",
      message: "Preencha nome, e-mail e uma senha de pelo menos 6 caracteres.",
    };
  }

  // O checkbox já é `required` no HTML (bloqueia o submit no navegador),
  // mas o servidor nunca confia só na validação do client.
  if (!acceptedTerms) {
    return {
      status: "error",
      message: "É necessário aceitar os Termos de Uso e a Política de Privacidade para continuar.",
    };
  }

  let userId: string | undefined;

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, plan: planSlug } },
    });
    if (error) {
      // Com confirmação de e-mail desligada (caso deste projeto), e-mail
      // duplicado vem como erro explícito.
      if (/already registered|already exists|user_already_exists/i.test(error.message)) {
        return { status: "email_exists", email, message: "Esse e-mail já tem uma conta na Ryze." };
      }
      throw error;
    }
    // Com confirmação de e-mail ligada, o Supabase não retorna erro (pra não
    // vazar quais e-mails já têm conta) — em vez disso devolve um usuário
    // "fake" com `identities: []`. É o sinal documentado de e-mail
    // duplicado nesse modo.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { status: "email_exists", email, message: "Esse e-mail já tem uma conta na Ryze." };
    }
    userId = data.user?.id;
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
  // (/api/webhooks/stripe) confirmar o pagamento e gravar em `subscriptions`.
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
        // client_reference_id vive só na Checkout Session; para os eventos
        // customer.subscription.updated/deleted (que só carregam o objeto
        // Subscription, sem a Session original) o webhook precisa achar o
        // usuário pela metadata da própria assinatura — por isso replicamos
        // o id aqui também via subscription_data.metadata.
        client_reference_id: userId,
        metadata: { plan: planSlug, name, supabase_user_id: userId ?? "" },
        subscription_data: {
          metadata: { plan: planSlug, supabase_user_id: userId ?? "" },
        },
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

  // Plano Grátis: manda direto pro painel — como o candidato ainda não tem
  // perfil, o painel encaminha automaticamente pro "Preencher perfil" (o
  // único formulário de entrada agora), que libera o link do grupo de
  // WhatsApp ao final.
  redirect("/para-candidatos/painel/curriculo");
}
