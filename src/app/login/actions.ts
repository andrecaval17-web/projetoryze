"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface LoginState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function signIn(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { status: "error", message: "Informe e-mail e senha." };
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  } catch (err) {
    console.error("Login failed", err);
    return {
      status: "error",
      message: "E-mail ou senha incorretos, ou a conta ainda não existe.",
    };
  }

  // Sessão com cookies + redirecionamento ao painel chegam na Fase 4.
  return { status: "success", message: "Login confirmado! O painel do candidato chega em breve." };
}
