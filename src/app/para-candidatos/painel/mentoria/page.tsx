import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarCheck, ExternalLink } from "lucide-react";
import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { getCurrentCycleRange } from "@/lib/mentoring";
import { PlanUpsell } from "@/components/painel/plan-upsell";
import { BackToPanel } from "@/components/painel/back-to-panel";
import { BookingWidget } from "./booking-widget";

export const metadata: Metadata = {
  title: "Sessão de Mentoria — Ryze",
  robots: { index: false, follow: false },
};

export default async function MentoriaPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cadastro?plano=gratis");
  }

  const plan = await getCurrentUserPlan();

  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("full_name, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/para-candidatos/painel/curriculo");
  }

  let existingSession: { cal_booking_uid: string; scheduled_at: string } | null = null;

  if (plan === "mentoria") {
    const { start, end } = getCurrentCycleRange();
    const { data } = await supabase
      .from("mentoring_sessions")
      .select("cal_booking_uid, scheduled_at")
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .gte("scheduled_at", start.toISOString())
      .lte("scheduled_at", end.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    existingSession = data;
  }

  const calLink = (process.env.NEXT_PUBLIC_CALCOM_LINK ?? "").replace(/^https?:\/\/cal\.com\//, "");

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <BackToPanel />
      <h1 className="mt-4 font-display text-display-md font-semibold text-fg">Sessão de Mentoria</h1>
      <p className="mt-2 text-body-md text-fg-muted">
        Uma sessão de 30 minutos por mês com um consultor de recolocação.
      </p>

      <div className="mt-8">
        {plan !== "mentoria" ? (
          <PlanUpsell feature="Sessão de Mentoria" requiredPlanLabel="Mentoria" />
        ) : existingSession ? (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-lg border border-accent-500/40 bg-bg-surface p-10 text-center shadow-glow-sm">
            <CalendarCheck className="h-8 w-8 text-accent-600 dark:text-accent-400" />
            <div>
              <h2 className="font-display text-heading-md font-semibold text-fg">
                Sua sessão está confirmada
              </h2>
              <p className="mt-2 text-body-md text-fg">
                {new Date(existingSession.scheduled_at).toLocaleString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                  // Sem isso, o horário sai no fuso do servidor (UTC na
                  // Vercel) em vez do horário local do candidato — a sessão
                  // marcada pra 07:30 em Brasília aparecia como "10:30" no
                  // painel (achado da auditoria de mobile, 2026-07-23).
                  timeZone: "America/Sao_Paulo",
                })}
              </p>
              <p className="mt-2 text-body-sm text-fg-muted">
                Você já tem uma sessão marcada neste ciclo. Para cancelar ou reagendar, use a
                página de gerenciamento do Cal.com — o link também está no e-mail de confirmação
                que você recebeu.
              </p>
            </div>
            <a
              href={`https://cal.com/booking/${existingSession.cal_booking_uid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-600 hover:underline dark:text-accent-400"
            >
              Gerenciar sessão (cancelar / reagendar) <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-bg-surface">
            <BookingWidget
              calLink={calLink}
              userId={user.id}
              name={profile.full_name}
              email={profile.email}
            />
          </div>
        )}
      </div>
    </div>
  );
}
