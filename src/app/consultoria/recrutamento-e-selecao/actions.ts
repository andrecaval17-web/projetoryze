"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendRecruitmentLeadEmail } from "@/lib/email/recruitment-lead";
import { getGeoCity } from "@/lib/geo/cities";

export interface RecruitmentLeadState {
  status: "idle" | "success" | "error";
  message?: string;
}

const URGENCY_VALUES = ["imediata", "ate_30_dias", "pesquisando"] as const;

const NATIONAL_SOURCE_PAGE = "/consultoria/recrutamento-e-selecao";

// Mesmo slug de GEO_PAGE_TYPES pra esse tipo (src/lib/geo/page-types.ts) —
// hardcoded aqui (em vez de importar o catálogo geo inteiro) porque essa
// action só precisa reconhecer este único tipo de página geo.
const GEO_ORIGIN_PATTERN = /^\/recrutamento-e-selecao\/([a-z]{2})\/([a-z0-9-]+)$/;

/**
 * Resolve o `source_page` real a partir do que o formulário mandou em
 * `origin_path` — nunca confia nesse valor direto (vem de um hidden
 * field, controlado pelo client). Só duas formas são aceitas: a rota
 * nacional exata, ou `/recrutamento-e-selecao/{uf}/{cidade}` com uf/cidade
 * batendo numa cidade ativa de `geo_cities` (mesma checagem de
 * `getGeoCity` que a própria página geo usa pra existir). Qualquer outro
 * valor — formato errado, cidade inexistente ou inativa, campo ausente —
 * cai no fixo da rota nacional, sem erro pro visitante.
 */
async function resolveLeadSource(
  originPath: string
): Promise<{ sourcePage: string; cityLabel: string | null }> {
  if (originPath === NATIONAL_SOURCE_PAGE) {
    return { sourcePage: NATIONAL_SOURCE_PAGE, cityLabel: null };
  }

  const match = GEO_ORIGIN_PATTERN.exec(originPath);
  if (match) {
    const [, uf, citySlug] = match;
    const city = await getGeoCity(uf, citySlug);
    if (city) {
      return { sourcePage: originPath, cityLabel: `${city.name}/${city.uf.toUpperCase()}` };
    }
  }

  return { sourcePage: NATIONAL_SOURCE_PAGE, cityLabel: null };
}

// Limites generosos pra formulário real (nunca o esperado de alguém
// preenchendo à mão), só pra rejeitar payload abusivo antes de chegar no
// banco ou no e-mail.
const MAX_NAME_LENGTH = 120;
const MAX_COMPANY_LENGTH = 120;
const MAX_ROLE_LENGTH = 120;
const MAX_PHONE_LENGTH = 30;

// Aceita dígitos e os símbolos comuns de telefone (+, espaço, parênteses,
// hífen) — rejeita qualquer outra coisa (letras, HTML, etc.) antes mesmo de
// contar os dígitos.
const PHONE_CHARS_PATTERN = /^[0-9+()\-\s]+$/;
const MIN_PHONE_DIGITS = 10;

// Limite simples de envios por telefone na própria tabela `leads` — sem
// infraestrutura nova (sem Redis/contador dedicado). Usa o client
// service-role porque a policy de RLS de `leads` só libera INSERT pro
// anon, não SELECT — o client anon normal não conseguiria nem ler de volta
// pra contar.
const MAX_SUBMISSIONS_PER_PHONE_PER_HOUR = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, "").length;
}

export async function submitRecruitmentLead(
  _prevState: RecruitmentLeadState,
  formData: FormData
): Promise<RecruitmentLeadState> {
  // Honeypot: campo invisível pra humano, qualquer bot que preenche todo
  // input do formulário cai aqui. Finge sucesso pro visitante (nunca
  // revela que foi detectado) e não grava nem envia nada.
  const honeypot = String(formData.get("website") || "").trim();
  if (honeypot) {
    return { status: "success", message: "Recebemos seus dados! Nosso time comercial vai te contatar em breve." };
  }

  const name = String(formData.get("name") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const urgency = String(formData.get("urgency") || "");

  if (!name || !company || !phone || !role) {
    return { status: "error", message: "Preencha todos os campos." };
  }
  if (
    name.length > MAX_NAME_LENGTH ||
    company.length > MAX_COMPANY_LENGTH ||
    role.length > MAX_ROLE_LENGTH ||
    phone.length > MAX_PHONE_LENGTH
  ) {
    return { status: "error", message: "Um dos campos está grande demais. Revise e tente novamente." };
  }
  if (!PHONE_CHARS_PATTERN.test(phone) || countPhoneDigits(phone) < MIN_PHONE_DIGITS) {
    return { status: "error", message: "Informe um WhatsApp válido (com DDD)." };
  }
  if (!URGENCY_VALUES.includes(urgency as (typeof URGENCY_VALUES)[number])) {
    return { status: "error", message: "Selecione a urgência da contratação." };
  }

  const originPathRaw = formData.get("origin_path");
  const { sourcePage, cityLabel } = await resolveLeadSource(
    typeof originPathRaw === "string" ? originPathRaw : NATIONAL_SOURCE_PAGE
  );

  try {
    const admin = getSupabaseAdminClient();
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await admin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("created_at", since);

    if (countError) {
      console.error("Failed to check recruitment lead rate limit", countError);
    } else if ((count ?? 0) >= MAX_SUBMISSIONS_PER_PHONE_PER_HOUR) {
      return {
        status: "error",
        message: "Já recebemos seus dados recentemente. Nosso time comercial vai te contatar em breve.",
      };
    }
  } catch (err) {
    // Falha ao checar o limite nunca deve impedir um lead legítimo de ser
    // salvo — só loga e segue.
    console.error("Failed to check recruitment lead rate limit", err);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("leads").insert({
      type: "consultoria",
      name,
      email: null,
      phone,
      company,
      message: `${cityLabel ? `Cidade: ${cityLabel}\n` : ""}Cargo a contratar: ${role}\nUrgência: ${urgency}`,
      source_page: sourcePage,
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
