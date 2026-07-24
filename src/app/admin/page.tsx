import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentMonthRange } from "@/lib/admin/date-ranges";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = { title: "Dashboard — Admin Ryze" };

export default async function AdminDashboardPage() {
  const supabase = getSupabaseAdminClient();
  const { start, end } = getCurrentMonthRange();

  const [{ count: totalCandidates }, { data: activeSubs }, { count: leadsThisMonth }, { count: aiCallsThisMonth }] =
    await Promise.all([
      supabase.from("candidate_profiles").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("plan").eq("status", "active"),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
      supabase
        .from("ai_usage_log")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
    ]);

  const impulsoCount = activeSubs?.filter((s) => s.plan === "impulso").length ?? 0;
  const mentoriaCount = activeSubs?.filter((s) => s.plan === "mentoria").length ?? 0;
  const gratisCount = Math.max((totalCandidates ?? 0) - impulsoCount - mentoriaCount, 0);
  const mrr = impulsoCount * 19.9 + mentoriaCount * 49.9;

  const formattedMrr = mrr.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <h1 className="font-display text-display-md font-semibold text-fg">Dashboard</h1>
      <p className="mt-1 text-body-sm text-fg-muted">Visão geral do negócio.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-heading-sm">Candidatos por plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5 text-body-sm">
              <div className="flex justify-between">
                <span className="text-fg-muted">Grátis</span>
                <span className="font-medium text-fg">{gratisCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-muted">Impulso</span>
                <span className="font-medium text-fg">{impulsoCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-muted">Mentoria</span>
                <span className="font-medium text-fg">{mentoriaCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-heading-sm">MRR estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-display-sm font-semibold text-accent-500">{formattedMrr}</p>
            <p className="mt-1 text-caption text-fg-muted">
              {impulsoCount} Impulso × R$ 19,90 + {mentoriaCount} Mentoria × R$ 49,90
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-heading-sm">Leads neste mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-display-sm font-semibold text-fg">{leadsThisMonth ?? 0}</p>
            <p className="mt-1 text-caption text-fg-muted">Consultoria, produtos e contato</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-heading-sm">Chamadas de IA neste mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-display-sm font-semibold text-fg">{aiCallsThisMonth ?? 0}</p>
            <p className="mt-1 text-caption text-fg-muted">Currículo + LinkedIn + entrevista</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
