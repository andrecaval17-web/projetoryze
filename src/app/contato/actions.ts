"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface LeadFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function submitLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const type = String(formData.get("type") || "outro");
  const message = String(formData.get("message") || "").trim();
  const consent = formData.get("consent");

  if (!name || !email) {
    return { status: "error", message: "Preencha nome e e-mail." };
  }
  if (!consent) {
    return { status: "error", message: "É necessário concordar em ser contatado." };
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("leads").insert({
      type,
      name,
      email,
      phone: phone || null,
      company: company || null,
      message: message || null,
      source_page: "/contato",
    });
    if (error) throw error;
  } catch (err) {
    console.error("Failed to submit lead", err);
    return {
      status: "error",
      message:
        // TODO: trocar pelo e-mail/canal de contato real da Ryze
        "Não foi possível enviar agora. Tente novamente em instantes ou escreva direto para contato@ryze.com.br.",
    };
  }

  return { status: "success", message: "Recebemos seu contato! Vamos responder em breve." };
}
