import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cookie-aware client for Server Components / Server Actions / Route
 * Handlers — reads and (where possible) writes the session cookie, which is
 * what makes login persist across requests. Async because `cookies()` is.
 */
export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não está configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    // HttpOnly: nada no client-side lê esse cookie (o browser client em
    // client.ts foi removido por não ter uso — auth é 100% server-side aqui),
    // então dá pra fechar o acesso via document.cookie sem quebrar nada.
    cookieOptions: { httpOnly: true },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chamado de dentro de um Server Component (não de uma Server
          // Action/Route Handler) — não pode escrever cookie aqui. Sem
          // problema: o middleware já cuida de renovar a sessão a cada
          // request.
        }
      },
    },
  });
}

/**
 * Plano ativo do usuário logado, lendo a sessão + a tabela `subscriptions`.
 * Base do controle de acesso do painel (Fase 4): `null` = deslogado,
 * `"gratis"` = logado sem assinatura paga ativa, senão o plano pago vigente.
 *
 * Usa uma query ordenada (mais recente primeiro) em vez de `.maybeSingle()`
 * de propósito: `.maybeSingle()` falha se mais de uma linha `active` bater
 * no filtro, e o erro resultante NUNCA pode ser engolido em silêncio — foi
 * exatamente isso que mascarou, por tempo indeterminado, o bug de assinatura
 * duplicada no upgrade (ver `upgradeToPlan`): a query falhava, o erro era
 * descartado, e o fallback pra "gratis" fazia o candidato pago parecer
 * gratuito sem nenhum log indicando por quê.
 */
export async function getCurrentUserPlan(): Promise<
  "gratis" | "impulso" | "mentoria" | null
> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error(`[getCurrentUserPlan] falha ao consultar subscriptions do usuário ${user.id}`, error);
  }

  return (data?.[0]?.plan as "impulso" | "mentoria" | undefined) ?? "gratis";
}

export interface CurrentSubscription {
  id: string;
  plan: "impulso" | "mentoria";
  onboarding_seen_at: string | null;
}

/**
 * Mesma query/ordenação de `getCurrentUserPlan()`, mas devolvendo a linha
 * inteira (não só o `plan`) — usado pelo guia de onboarding (hub), que
 * precisa do `id` da assinatura pra gravar `onboarding_seen_at` na linha
 * certa. `null` cobre deslogado E plano Grátis (sem assinatura ativa) —
 * o guia de onboarding só existe pra plano pago.
 */
export async function getCurrentSubscription(): Promise<CurrentSubscription | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, plan, onboarding_seen_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error(`[getCurrentSubscription] falha ao consultar subscriptions do usuário ${user.id}`, error);
    return null;
  }

  return (data?.[0] as CurrentSubscription | undefined) ?? null;
}
