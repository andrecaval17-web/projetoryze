const CALCOM_API_BASE = "https://api.cal.com/v2";

/**
 * ID do event type "Sessão de Mentoria — Ryze" (30min) no Cal.com da conta
 * andre-cavalcanti-ycpcvc — confirmado via `GET /v2/event-types` com a
 * chave real. Usado pra ignorar webhooks de outros event types, caso a
 * conta ganhe mais eventos no futuro.
 */
export const MENTORING_EVENT_TYPE_ID = 6334839;

function getCalcomApiKey(): string {
  const key = process.env.CALCOM_API_KEY;
  if (!key) {
    throw new Error("Cal.com não está configurado: defina CALCOM_API_KEY em .env.local");
  }
  return key;
}

/**
 * Cancela uma reserva no Cal.com. Usado tanto pelo candidato (botão
 * "Cancelar" na página de mentoria) quanto pelo próprio webhook (regra de
 * negócio: nunca deixar uma segunda reserva confirmada no mesmo ciclo —
 * ver src/app/api/webhooks/calcom/route.ts).
 */
export async function cancelCalcomBooking(bookingUid: string, reason: string): Promise<void> {
  const res = await fetch(`${CALCOM_API_BASE}/bookings/${bookingUid}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getCalcomApiKey()}`,
      "Content-Type": "application/json",
      "cal-api-version": "2026-02-25",
    },
    body: JSON.stringify({ cancellationReason: reason }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Falha ao cancelar reserva no Cal.com (${res.status}): ${body}`);
  }
}
