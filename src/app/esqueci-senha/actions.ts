"use server";

import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ForgotPasswordState {
  status: "idle" | "success" | "error";
  message?: string;
}

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    return { status: "error", message: "Informe seu e-mail." };
  }

  try {
    const supabase = await getSupabaseServerClient();
    const baseUrl = await getBaseUrl();
    // O Supabase não avisa se o e-mail existe ou não (mesmo padrão do
    // login, evita vazar quais contas existem) — por isso a mensagem de
    // sucesso abaixo é sempre genérica, mesmo quando a conta não existe.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/redefinir-senha`,
    });
    if (error) throw error;
  } catch (err) {
    console.error("Password reset request failed", err);
    return {
      status: "error",
      message: "Não foi possível enviar o e-mail agora. Tente novamente em instantes.",
    };
  }

  return { status: "success" };
}
