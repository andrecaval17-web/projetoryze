"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * `subscriptions` não tem policy de update pro usuário comum (só o webhook
 * do Stripe escreve lá, de propósito — ver 0002_subscriptions.sql). Em vez
 * de abrir uma policy geral só pra gravar 1 coluna, autentica aqui com o
 * client normal (confirma de quem é a sessão) e usa a service role só pra
 * este update pontual, sempre escopado por `user_id` E `id` da assinatura —
 * nunca por `id` sozinho, pra um usuário nunca conseguir marcar a
 * introdução de outra pessoa como vista.
 */
export async function dismissOnboardingIntro(subscriptionId: string): Promise<{ status: "success" | "error" }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error" };
  }

  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({ onboarding_seen_at: new Date().toISOString() })
    .eq("id", subscriptionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to dismiss onboarding intro", error);
    return { status: "error" };
  }

  return { status: "success" };
}
