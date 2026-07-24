import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses Row Level Security. Server-only, and only
 * for contexts with no user session to act as (webhooks, cron jobs). Never
 * import this from a Client Component or from code reachable by user input
 * without your own authorization check first.
 */
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase admin não está configurado: defina SUPABASE_SERVICE_ROLE_KEY em .env.local"
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
