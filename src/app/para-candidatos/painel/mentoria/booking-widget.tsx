"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

interface BookingWidgetProps {
  calLink: string;
  userId: string;
  name: string;
  email: string;
}

export function BookingWidget({ calLink, userId, name, email }: BookingWidgetProps) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", { theme: "auto", styles: { branding: { brandColor: "#e85c2a" } } });
    })();
  }, []);

  return (
    <Cal
      calLink={calLink}
      // "supabase-user-id" é um campo customizado oculto criado no event
      // type via API (PATCH /v2/event-types/6334839) — o webhook usa esse
      // valor como identificador primário do candidato (não o e-mail
      // digitado no formulário). Como é `hidden: true`, o candidato nunca
      // vê nem edita esse campo; ele só existe pra fechar o vínculo
      // candidato↔reserva de forma robusta.
      config={{ name, email, "supabase-user-id": userId }}
      style={{ width: "100%", height: "100%", minHeight: "600px" }}
    />
  );
}
