import { requireOwner } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { InviteForm } from "./invite-form";
import { RemoveButton } from "./remove-button";

export const metadata = { title: "Equipe — Admin Ryze" };

export default async function AdminEquipePage() {
  // Checagem extra além do layout: /admin/equipe exige role='owner'
  // especificamente, não só "ser admin".
  const session = await requireOwner();

  const supabase = getSupabaseAdminClient();
  const { data: admins } = await supabase
    .from("admin_users")
    .select("id, user_id, role, created_at")
    .order("created_at", { ascending: true });

  const rows = await Promise.all(
    (admins ?? []).map(async (admin) => {
      const { data } = await supabase.auth.admin.getUserById(admin.user_id);
      return { ...admin, email: data.user?.email ?? "(e-mail não encontrado)" };
    })
  );

  return (
    <div>
      <h1 className="font-display text-display-md font-semibold text-fg">Equipe</h1>
      <p className="mt-1 text-body-sm text-fg-muted">Quem tem acesso ao painel administrativo.</p>

      <div className="mt-8 rounded-lg border border-border bg-bg-surface p-6">
        <h2 className="mb-3 font-display text-heading-sm font-semibold text-fg">Convidar admin</h2>
        <InviteForm />
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-body-sm">
          <thead className="border-b border-border bg-bg-surface text-caption uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((admin) => (
              <tr key={admin.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-fg">
                  {admin.email}
                  {admin.user_id === session.userId && (
                    <span className="ml-2 text-caption text-fg-muted">(você)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={admin.role === "owner" ? "accent-soft" : "neutral"}>
                    {admin.role === "owner" ? "Owner" : "Admin"}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                  {new Date(admin.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <RemoveButton adminRowId={admin.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
