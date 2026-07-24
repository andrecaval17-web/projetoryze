"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const VALID_STATUSES = ["novo", "contatado", "convertido", "descartado"] as const;
export type LeadStatus = (typeof VALID_STATUSES)[number];

export async function updateLeadStatus(leadId: string, status: string): Promise<void> {
  await requireAdmin();

  if (!VALID_STATUSES.includes(status as LeadStatus)) {
    throw new Error("Status inválido.");
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    console.error("[admin] falha ao atualizar status do lead", error);
    throw new Error("Não foi possível atualizar o status.");
  }

  revalidatePath("/admin/leads");
}
