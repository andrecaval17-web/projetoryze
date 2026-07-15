import { createClient } from "@supabase/supabase-js";

/**
 * Anon-key client for server-side writes that are meant to be public (e.g.
 * the lead form) and are gated by RLS policies, not by this key. Created
 * lazily so a missing env var surfaces as a normal action error instead of
 * crashing the module at import time.
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não está configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local"
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
