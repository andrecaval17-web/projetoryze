import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "admin";

export interface AdminSession {
  userId: string;
  role: AdminRole;
}

/**
 * Ponto ÚNICO de verificação de acesso admin — toda página/Server Action de
 * /admin/* chama isto no topo, nunca reimplementa a checagem. Duas etapas
 * deliberadas:
 *
 * 1. Confirma sessão + presença em `admin_users` usando o cliente normal
 *    (respeita RLS — a policy só deixa cada admin ver a própria linha, então
 *    isso não vaza se OUTRA pessoa é admin, só confirma "eu sou").
 * 2. Só depois disso o caller passa a usar `getSupabaseAdminClient()`
 *    (service_role) pra buscar dados de todos os usuários — nunca antes.
 *
 * Não-admin é redirecionado pra home em silêncio — sem mensagem de "acesso
 * negado" que confirme a existência da área administrativa.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: adminRow, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  // Erro de verdade (RLS, rede, etc.) é bem diferente de "não é admin" — sem
  // logar isso, os dois casos ficavam indistinguíveis e um problema real de
  // configuração parecia só "usuário sem acesso".
  if (error) {
    console.error(`[admin] erro consultando admin_users pro usuário ${user.id}`, error);
    redirect("/");
  }

  if (!adminRow) {
    redirect("/");
  }

  return { userId: user.id, role: adminRow.role as AdminRole };
}

/** Mesma checagem, mas exige role='owner' — usado por /admin/equipe. */
export async function requireOwner(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (session.role !== "owner") {
    redirect("/admin");
  }
  return session;
}
