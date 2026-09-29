"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface LeadFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

// Mesmos rótulos de src/app/contato/page.tsx — mantidos aqui também porque a
// Server Action não tem acesso aos searchParams da página, só ao FormData
// dos campos ocultos que o ContactForm preenche a partir deles.
const PRODUCT_LABELS: Record<string, string> = {
  academy: "Ryze Academy",
  cultura: "Ryze HR · Cultura & Engajamento",
};

const INTENT_LABELS: Record<string, string> = {
  especialista: "Falar com um especialista",
  demonstracao: "Agendar demonstração",
};

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
  const produto = String(formData.get("produto") || "");
  const intencao = String(formData.get("intencao") || "");

  if (!name || !email) {
    return { status: "error", message: "Preencha nome e e-mail." };
  }
  if (!consent) {
    return { status: "error", message: "É necessário concordar em ser contatado." };
  }

  const productLabel = PRODUCT_LABELS[produto];
  const sourcePage = productLabel
    ? `/produtos/${produto} (${INTENT_LABELS[intencao] ?? "contato"})`
    : "/contato";

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("leads").insert({
      type,
      name,
      email,
      phone: phone || null,
      company: company || null,
      message: message || null,
      source_page: sourcePage,
    });
    if (error) throw error;
  } catch (err) {
    console.error("Failed to submit lead", err);
    return {
      status: "error",
      message:
        // TODO: trocar pelo e-mail/canal de contato real da Ryze
        "Não foi possível enviar agora. Tente novamente em instantes ou escreva direto para comercial@ryzerh.com.br.",
    };
  }

  return { status: "success", message: "Recebemos seu contato! Vamos responder em breve." };
}
