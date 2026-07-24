import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { StatusSelect } from "./status-select";
import type { LeadStatus } from "./actions";

export const metadata = { title: "Leads — Admin Ryze" };

const TYPE_LABELS: Record<string, string> = {
  consultoria: "Consultoria",
  produtos: "Produtos",
  candidato: "Candidato",
  outro: "Outro",
};

const TYPES = ["todos", "consultoria", "produtos", "candidato", "outro"] as const;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo = "todos" } = await searchParams;

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("leads")
    .select("id, type, name, email, phone, company, source_page, status, created_at")
    .order("created_at", { ascending: false });

  if (tipo !== "todos") {
    query = query.eq("type", tipo);
  }

  const { data: leads } = await query;

  return (
    <div>
      <h1 className="font-display text-display-md font-semibold text-fg">Leads</h1>
      <p className="mt-1 text-body-sm text-fg-muted">Contatos de consultoria, produtos e site.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Link
            key={t}
            href={t === "todos" ? "/admin/leads" : `/admin/leads?tipo=${t}`}
            className={`rounded-full px-3.5 py-1.5 text-body-sm font-medium transition-ryze ${
              tipo === t
                ? "bg-gradient-ryze text-white shadow-glow-sm"
                : "bg-bg-surface text-fg-muted hover:text-fg"
            }`}
          >
            {t === "todos" ? "Todos" : TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-body-sm">
          <thead className="border-b border-border bg-bg-surface text-caption uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr key={lead.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                  {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">{TYPE_LABELS[lead.type] ?? lead.type}</td>
                <td className="px-4 py-3 font-medium text-fg">{lead.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span>{lead.email}</span>
                    {lead.phone && <span className="text-caption text-fg-muted">{lead.phone}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-fg-muted">{lead.company ?? "—"}</td>
                <td className="px-4 py-3 text-fg-muted">{lead.source_page ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusSelect leadId={lead.id} status={lead.status as LeadStatus} />
                </td>
              </tr>
            ))}
            {(leads ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-fg-muted">
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
