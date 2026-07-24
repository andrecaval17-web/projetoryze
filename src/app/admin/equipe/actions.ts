"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { findUserIdByEmail } from "@/lib/admin/find-user-by-email";

export interface InviteState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function inviteAdmin(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const session = await requireOwner();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { status: "error", message: "Informe um e-mail válido." };
  }

  const supabase = getSupabaseAdminClient();

  // Se o usuário já existe no Supabase Auth, só vira admin (não faz sentido
  // reconvidar quem já tem conta). Se não existe, usa a API de convite do
  // Supabase (cria a conta e manda o e-mail de convite).
  let userId = await findUserIdByEmail(email);
  if (!userId) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
    if (error || !data.user) {
      console.error("[admin] falha ao convidar usuário", error);
      return { status: "error", message: "Não foi possível convidar esse e-mail." };
    }
    userId = data.user.id;
  }

  const { error: insertError } = await supabase
    .from("admin_users")
    .insert({ user_id: userId, role: "admin", invited_by: session.userId });

  if (insertError) {
    if (insertError.code === "23505") {
      return { status: "error", message: "Esse usuário já é admin." };
    }
    console.error("[admin] falha ao inserir admin_users", insertError);
    return { status: "error", message: "Não foi possível adicionar como admin." };
  }

  revalidatePath("/admin/equipe");
  return { status: "success", message: `${email} agora é admin.` };
}

export interface RemoveState {
  status: "success" | "error";
  message?: string;
}

export async function removeAdmin(adminRowId: string): Promise<RemoveState> {
  await requireOwner();

  const supabase = getSupabaseAdminClient();

  const { data: target } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("id", adminRowId)
    .maybeSingle();

  if (!target) {
    return { status: "error", message: "Admin não encontrado." };
  }

  if (target.role === "owner") {
    const { count } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })
      .eq("role", "owner");
    if ((count ?? 0) <= 1) {
      return { status: "error", message: "Não é possível remover o único owner." };
    }
  }

  const { error } = await supabase.from("admin_users").delete().eq("id", adminRowId);
  if (error) {
    console.error("[admin] falha ao remover admin", error);
    return { status: "error", message: "Não foi possível remover." };
  }

  revalidatePath("/admin/equipe");
  return { status: "success" };
}
