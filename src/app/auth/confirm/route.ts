import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Alvo dos links de e-mail que precisam de uma sessão real depois do clique
 * (hoje só a redefinição de senha — a confirmação de cadastro não passa por
 * aqui, ela usa o link padrão do Supabase direto pra /login). O template
 * "Reset Password" no painel do Supabase precisa apontar pra cá com
 * `{{ .TokenHash }}` e `type=recovery` (ver instruções entregues junto com
 * este código) em vez do `{{ .ConfirmationURL }}` padrão, porque só assim
 * dá pra trocar o token pelo cookie de sessão aqui no servidor antes de
 * mandar a pessoa pra tela de nova senha.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (tokenHash && type) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      redirect(`${origin}${next}`);
    }
  }

  redirect(`${origin}/esqueci-senha?erro=link-invalido`);
}
