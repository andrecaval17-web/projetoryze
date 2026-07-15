import { createClient } from "@supabase/supabase-js";

/** Browser client — used from Client Components (auth in Fase 3, painel in Fase 4). */
export function getSupabaseBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
