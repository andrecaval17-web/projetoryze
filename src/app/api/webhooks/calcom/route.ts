import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { cancelCalcomBooking, MENTORING_EVENT_TYPE_ID } from "@/lib/calcom/client";
import { getCurrentCycleRange } from "@/lib/mentoring";

// node:crypto (HMAC) não está disponível no Edge runtime.
export const runtime = "nodejs";

interface CalcomAttendee {
  email: string;
}

interface CalcomResponseField {
  value?: string;
}

interface CalcomBookingPayload {
  uid: string;
  eventTypeId: number;
  startTime: string;
  attendees?: CalcomAttendee[];
  // Respostas do formulário de agendamento, indexadas pelo slug do campo —
  // inclui campos ocultos, como o "supabase-user-id" que criamos no event
  // type. Ver resolveCandidateUserId().
  responses?: Record<string, CalcomResponseField>;
  // Só presente em BOOKING_RESCHEDULED — uid da reserva anterior que foi
  // substituída por esta.
  rescheduleUid?: string;
}

interface CalcomWebhookEvent {
  triggerEvent: string;
  payload: CalcomBookingPayload;
}

function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(signatureHeader, "utf8");
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Resolve qual candidato (user_id do Supabase) uma reserva pertence a.
 *
 * Caminho primário: o campo oculto "supabase-user-id", preenchido pela
 * nossa própria página via prefill no embed (o candidato nunca vê nem edita
 * esse campo — ver booking-widget.tsx). Só é aceito se o e-mail do
 * attendee bater com o e-mail cadastrado pra esse user_id, o que evita que
 * alguém forje o parâmetro na URL do Cal.com pra atribuir uma reserva à
 * conta de outra pessoa (o campo oculto sozinho não é suficiente prova de
 * identidade, já que é só um parâmetro de URL).
 *
 * Fallback: correspondência por e-mail do attendee — cobre reservas feitas
 * direto pelo link público do Cal.com, sem passar pela nossa página (e
 * portanto sem o campo oculto).
 */
async function resolveCandidateUserId(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  payload: CalcomBookingPayload
): Promise<string | null> {
  const attendeeEmail = payload.attendees?.[0]?.email?.trim().toLowerCase();
  const hiddenUserId = payload.responses?.["supabase-user-id"]?.value?.trim();

  if (hiddenUserId) {
    const { data: profileById } = await supabase
      .from("candidate_profiles")
      .select("user_id, email")
      .eq("user_id", hiddenUserId)
      .maybeSingle();

    if (profileById && attendeeEmail && profileById.email.trim().toLowerCase() === attendeeEmail) {
      return profileById.user_id;
    }
    console.error(
      `[calcom webhook] campo oculto supabase-user-id ("${hiddenUserId}") não bateu com o e-mail do attendee — usando fallback por e-mail`
    );
  }

  if (!attendeeEmail) return null;

  const { data: profileByEmail } = await supabase
    .from("candidate_profiles")
    .select("user_id")
    .ilike("email", attendeeEmail)
    .maybeSingle();

  return profileByEmail?.user_id ?? null;
}

/**
 * Trata BOOKING_CREATED e a "metade nova" de um BOOKING_RESCHEDULED (mesma
 * regra de negócio nos dois casos: só vira uma linha 'confirmed' se o
 * candidato for Mentoria ativo e não tiver outra sessão confirmada já
 * marcada pra dentro do mesmo ciclo mensal).
 */
async function upsertConfirmedSession(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  payload: CalcomBookingPayload
) {
  if (payload.eventTypeId !== MENTORING_EVENT_TYPE_ID) return;

  const userId = await resolveCandidateUserId(supabase, payload);

  if (!userId) {
    console.error(
      `[calcom webhook] não foi possível resolver o candidato da reserva ${payload.uid} — ignorando`
    );
    return;
  }

  // Defesa em profundidade: o link do Cal.com é público. Se alguém
  // agendou direto por ele (sem passar pelo gate da página /painel/mentoria)
  // e não é Mentoria ativo, a reserva é cancelada automaticamente.
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("plan", "mentoria")
    .eq("status", "active")
    .maybeSingle();

  if (!subscription) {
    console.error(
      `[calcom webhook] usuário ${userId} sem assinatura Mentoria ativa — cancelando reserva ${payload.uid}`
    );
    await cancelCalcomBooking(
      payload.uid,
      "Cancelado automaticamente: esta sessão é exclusiva do plano Mentoria."
    );
    return;
  }

  // Regra de negócio real, não só de UI: mesmo que o candidato tenha achado
  // um jeito de abrir o widget duas vezes (ou de agendar direto pelo link
  // público do Cal.com), o webhook nunca deixa uma segunda sessão
  // 'confirmed' sobreviver dentro do mesmo ciclo mensal.
  const { start, end } = getCurrentCycleRange(new Date(payload.startTime));
  const { data: conflicting } = await supabase
    .from("mentoring_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .gte("scheduled_at", start.toISOString())
    .lte("scheduled_at", end.toISOString());

  if (conflicting && conflicting.length > 0) {
    console.error(
      `[calcom webhook] usuário ${userId} já tem sessão confirmada neste ciclo — cancelando reserva extra ${payload.uid}`
    );
    await cancelCalcomBooking(
      payload.uid,
      "Cancelado automaticamente: você já tem uma sessão de mentoria confirmada neste ciclo."
    );
    return;
  }

  const { error } = await supabase.from("mentoring_sessions").insert({
    user_id: userId,
    cal_booking_uid: payload.uid,
    scheduled_at: payload.startTime,
    status: "confirmed",
  });

  if (error) {
    console.error("[calcom webhook] falha ao gravar mentoring_sessions", error);
    throw error;
  }
}

async function handleBookingCancelled(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  payload: CalcomBookingPayload
) {
  await supabase
    .from("mentoring_sessions")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("cal_booking_uid", payload.uid);
}

async function handleBookingRescheduled(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  payload: CalcomBookingPayload
) {
  if (payload.rescheduleUid) {
    await supabase
      .from("mentoring_sessions")
      .update({ status: "rescheduled", updated_at: new Date().toISOString() })
      .eq("cal_booking_uid", payload.rescheduleUid);
  }
  // A reserva nova passa pelas mesmas regras (plano ativo + sem conflito de
  // ciclo) de uma criação normal — a antiga já deixou de contar como
  // 'confirmed' na linha acima, então não gera falso conflito.
  await upsertConfirmedSession(supabase, payload);
}

export async function POST(req: Request) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[calcom webhook] CALCOM_WEBHOOK_SECRET não configurado");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-cal-signature-256");

  if (!isValidSignature(rawBody, signature, secret)) {
    console.error("[calcom webhook] assinatura inválida");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: CalcomWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    switch (event.triggerEvent) {
      case "BOOKING_CREATED":
        await upsertConfirmedSession(supabase, event.payload);
        break;
      case "BOOKING_CANCELLED":
        await handleBookingCancelled(supabase, event.payload);
        break;
      case "BOOKING_RESCHEDULED":
        await handleBookingRescheduled(supabase, event.payload);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[calcom webhook] erro processando evento ${event.triggerEvent}`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
