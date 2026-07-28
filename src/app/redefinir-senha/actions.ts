"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ResetPasswordState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function updatePassword(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (password.length < 6) {
    return { status: "error", message: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (password !== confirmPassword) {
    return { status: "error", message: "As senhas não coincidem." };
  }

  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "error", message: "Esse link expirou. Peça um novo link de redefinição." };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;

    // Sem signOut() aqui de propósito: a action de um <form> é seguida de
    // um refresh automático do Server Component pai (page.tsx), que decide
    // o que renderizar com base em `user` — se a sessão fosse encerrada
    // aqui, esse refresh trocaria o formulário pelo aviso de "link
    // expirado" antes da mensagem de sucesso abaixo chegar a aparecer.
  } catch (err) {
    console.error("Password update failed", err);
    return {
      status: "error",
      message: "Não foi possível atualizar a senha agora. Tente novamente.",
    };
  }

  return { status: "success" };
}
