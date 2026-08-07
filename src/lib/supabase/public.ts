import { createClient } from "@supabase/supabase-js";

/**
 * Anon-key client with no cookie dependency — para contextos sem request
 * (generateStaticParams, generateMetadata no build) que só precisam ler
 * conteúdo público protegido por uma policy RLS liberada pro anon (ex:
 * `geo_cities`). Não usar para nada que dependa de sessão do usuário: para
 * isso existe `getSupabaseServerClient()`.
 */
export function getSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não está configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local"
    );
  }

  return createClient(url, anonKey, { auth: { persistSession: false } });
}
