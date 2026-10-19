"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendRecruitmentLeadEmail } from "@/lib/email/recruitment-lead";

export interface RecruitmentLeadState {
  status: "idle" | "success" | "error";
  message?: string;
}

const URGENCY_VALUES = ["imediata", "ate_30_dias", "pesquisando"] as const;

const SOURCE_PAGE = "/consultoria/recrutamento-e-selecao";

export async function submitRecruitmentLead(
  _prevState: RecruitmentLeadState,
  formData: FormData
): Promise<RecruitmentLeadState> {
  const name = String(formData.get("name") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const urgency = String(formData.get("urgency") || "");

  if (!name || !company || !phone || !role) {
    return { status: "error", message: "Preencha todos os campos." };
  }
  if (!URGENCY_VALUES.includes(urgency as (typeof URGENCY_VALUES)[number])) {
    return { status: "error", message: "Selecione a urgência da contratação." };
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("leads").insert({
      type: "consultoria",
      name,
      email: null,
      phone,
      company,
      message: `Cargo a contratar: ${role}\nUrgência: ${urgency}`,
      source_page: SOURCE_PAGE,
    });
    if (error) throw error;
  } catch (err) {
    console.error("Failed to submit recruitment lead", err);
    return {
      status: "error",
      message: "Não foi possível enviar agora. Tente novamente em instantes ou fale direto pelo WhatsApp.",
    };
  }

  // Lead já está salvo — o e-mail pro time comercial é só um aviso a mais,
  // best-effort, nunca pode fazer o visitante ver erro depois de enviado
  // com sucesso.
  try {
    await sendRecruitmentLeadEmail({ name, company, phone, role, urgency });
  } catch (err) {
    console.error("Failed to send recruitment lead email", err);
  }

  return { status: "success", message: "Recebemos seus dados! Nosso time comercial vai te contatar em breve." };
}
