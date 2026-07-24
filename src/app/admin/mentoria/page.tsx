import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isFutureDate } from "@/lib/admin/date-ranges";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Mentoria — Admin Ryze" };

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  rescheduled: "Reagendada",
};

export default async function AdminMentoriaPage() {
  const supabase = getSupabaseAdminClient();

  const [{ data: sessions }, { data: profiles }] = await Promise.all([
    supabase
      .from("mentoring_sessions")
      .select("id, user_id, scheduled_at, status, created_at")
      .order("scheduled_at", { ascending: true }),
    supabase.from("candidate_profiles").select("user_id, full_name, email"),
  ]);

  const profileByUserId = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return (
    <div>
      <h1 className="font-display text-display-md font-semibold text-fg">Sessões de Mentoria</h1>
      <p className="mt-1 text-body-sm text-fg-muted">Todas as sessões agendadas via Cal.com.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-body-sm">
          <thead className="border-b border-border bg-bg-surface text-caption uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="px-4 py-3">Candidato</th>
              <th className="px-4 py-3">Data/hora</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(sessions ?? []).map((session) => {
              const profile = profileByUserId.get(session.user_id);
              const isFuture = isFutureDate(session.scheduled_at) && session.status === "confirmed";
              return (
                <tr
                  key={session.id}
                  className={`border-b border-border last:border-0 ${isFuture ? "bg-accent-500/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-fg">{profile?.full_name ?? "Candidato desconhecido"}</span>
                      {profile?.email && <span className="text-caption text-fg-muted">{profile.email}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={isFuture ? "font-medium text-fg" : "text-fg-muted"}>
                      {new Date(session.scheduled_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isFuture && (
                      <Badge variant="accent-soft" className="ml-2">
                        Futura
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={session.status === "confirmed" ? "accent-soft" : "neutral"}>
                      {STATUS_LABELS[session.status] ?? session.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {(sessions ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-fg-muted">
                  Nenhuma sessão agendada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
