"use server";

import { redirect } from "next/navigation";
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

  let signedIn = false;
  let isAdmin = false;

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    signedIn = true;

    // Conta de admin (equipe/owner) loga direto em /admin — é onde essa
    // conta trabalha no dia a dia, não na área de candidato. Falha nesta
    // checagem não deve barrar o login: só faz cair no destino de candidato.
    try {
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user?.id ?? "")
        .maybeSingle();
      isAdmin = !!adminRow;
    } catch (adminErr) {
      console.error("Failed to check admin_users after login", adminErr);
    }
  } catch (err) {
    console.error("Login failed", err);
    return {
      status: "error",
      message: "E-mail ou senha incorretos, ou a conta ainda não existe.",
    };
  }

  // redirect() fora do try/catch — ver nota equivalente em cadastro/actions.ts.
  // Candidato cai no painel dele (mostra todas as ferramentas/planos, com
  // "Currículo com IA" destacado se ainda não tem perfil) em vez da home
  // institucional.
  if (signedIn) {
    redirect(isAdmin ? "/admin" : "/para-candidatos/painel");
  }

  return { status: "success" };
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
