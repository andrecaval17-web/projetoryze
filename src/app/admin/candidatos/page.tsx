import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Candidatos — Admin Ryze" };

const PLAN_LABELS: Record<string, string> = { gratis: "Grátis", impulso: "Impulso", mentoria: "Mentoria" };

export default async function AdminCandidatosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const supabase = getSupabaseAdminClient();

  let profileQuery = supabase
    .from("candidate_profiles")
    .select("user_id, full_name, email, created_at")
    .order("created_at", { ascending: false });

  if (q.trim()) {
    const term = q.trim().replace(/[%_]/g, "");
    profileQuery = profileQuery.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const [{ data: profiles }, { data: subscriptions }] = await Promise.all([
    profileQuery,
    supabase.from("subscriptions").select("user_id, plan, status, created_at").order("created_at", { ascending: false }),
  ]);

  // Assinatura mais recente por usuário — no caso raro de haver histórico
  // (upgrade/downgrade gera uma linha nova em vez de sobrescrever, ver
  // 0002_subscriptions.sql), a mais recente é a que vale.
  const latestSubByUser = new Map<string, { plan: string; status: string }>();
  for (const sub of subscriptions ?? []) {
    if (!latestSubByUser.has(sub.user_id)) {
      latestSubByUser.set(sub.user_id, { plan: sub.plan, status: sub.status });
    }
  }

  return (
    <div>
      <h1 className="font-display text-display-md font-semibold text-fg">Candidatos</h1>
      <p className="mt-1 text-body-sm text-fg-muted">Todos os candidatos cadastrados.</p>

      <form className="mt-6 max-w-sm" action="/admin/candidatos" method="get">
        <Input name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail..." />
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-body-sm">
          <thead className="border-b border-border bg-bg-surface text-caption uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Status da assinatura</th>
              <th className="px-4 py-3">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((profile) => {
              const sub = latestSubByUser.get(profile.user_id);
              const plan = sub?.status === "active" ? sub.plan : "gratis";
              return (
                <tr key={profile.user_id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-fg">{profile.full_name}</td>
                  <td className="px-4 py-3 text-fg-muted">{profile.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={plan === "gratis" ? "neutral" : "accent-soft"}>
                      {PLAN_LABELS[plan] ?? plan}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{plan !== "gratis" ? sub?.status : "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                    {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              );
            })}
            {(profiles ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-fg-muted">
                  Nenhum candidato encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
