import Stripe from "stripe";

/**
 * Lazily created so a missing key surfaces as a normal action error instead
 * of crashing the module at import time — same pattern as the Supabase client.
 */
export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      "Stripe não está configurado: defina STRIPE_SECRET_KEY em .env.local"
    );
  }

  return new Stripe(key);
}
