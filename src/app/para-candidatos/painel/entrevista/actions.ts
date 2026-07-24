"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface NextStep {
  text: string;
  done: boolean;
}

/** Marca/desmarca um item do checklist de próximos passos do parecer final. */
export async function toggleInterviewNextStep(
  sessionId: string,
  stepIndex: number
): Promise<{ status: "success" | "error"; message?: string; nextSteps?: NextStep[] }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sua sessão expirou. Faça login novamente." };
  }

  const { data: row, error: fetchError } = await supabase
    .from("interview_sessions")
    .select("next_steps")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !row) {
    return { status: "error", message: "Não foi possível encontrar este checklist." };
  }

  const steps = (row.next_steps as NextStep[] | null) ?? [];
  if (stepIndex < 0 || stepIndex >= steps.length) {
    return { status: "error", message: "Item inválido." };
  }

  const updatedSteps = steps.map((s, i) => (i === stepIndex ? { ...s, done: !s.done } : s));

  const { error } = await supabase
    .from("interview_sessions")
    .update({ next_steps: updatedSteps })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to toggle interview next step", error);
    return { status: "error", message: "Não foi possível salvar." };
  }

  return { status: "success", nextSteps: updatedSteps };
}
