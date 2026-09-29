"use server";

import { redirect } from "next/navigation";
import { type EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * So roda quando a pessoa clica no botao "Confirmar" em page.tsx - uma
 * Server Action so executa com uma submissao de formulario real, entao um
 * verificador automatico de e-mail que apenas abre o link (GET) nunca
 * chega a chamar essa funcao nem consumir o token sozinho.
 */
export async function confirmToken(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") || "");
  const type = String(formData.get("type") || "") as EmailOtpType;
  const next = String(formData.get("next") || "/");

  if (tokenHash && type) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      redirect(next);
    }
  }

  redirect("/esqueci-senha?erro=link-invalido");
}
