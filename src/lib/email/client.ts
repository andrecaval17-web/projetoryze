import { Resend } from "resend";

let cached: Resend | null = null;

/**
 * `null` sem `RESEND_API_KEY` configurada — mesmo padrão de degradação
 * graciosa dos outros clientes do projeto (Supabase, Stripe): quem chama
 * decide se isso é um erro fatal ou só um log de aviso.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!cached) cached = new Resend(apiKey);
  return cached;
}
