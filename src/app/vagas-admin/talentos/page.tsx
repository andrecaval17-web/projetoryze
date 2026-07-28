import Link from "next/link";
import { Users } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TalentPoolTable, type TalentPoolRow } from "./talent-pool-table";

export const metadata = { title: "Banco de Talentos — Ryze" };

export default async function TalentPoolPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cargo?: string; habilidade?: string; origem?: string }>;
}) {
  const { q = "", cargo = "", habilidade = "", origem = "" } = await searchParams;
  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from("talent_pool")
    .select("id, source, name, email, phone, target_role, skills, summary, created_at")
    .order("created_at", { ascending: false });

  if (q.trim()) {
    const term = q.trim().replace(/[%_]/g, "");
    query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
  }
  if (cargo.trim()) {
    query = query.ilike("target_role", `%${cargo.trim().replace(/[%_]/g, "")}%`);
  }
  if (origem === "cadastro" || origem === "candidatura_vaga") {
    query = query.eq("source", origem);
  }

  const [{ data, error }, { data: jobs }] = await Promise.all([
    query,
    supabase
      .from("ats_job_postings")
      .select("id, title")
      .eq("status", "aberta")
      .order("created_at", { ascending: false }),
  ]);
  if (error) console.error("Failed to load talent_pool", error);

  // Busca por habilidade é parcial (ex: "React" deve achar "React avançado"),
  // mas `.contains()` do PostgREST só casa item exato do array — filtra em
  // memória em vez disso. talent_pool não tem volume que justifique RPC.
  const habilidadeTerm = habilidade.trim().toLowerCase();
  const talents = ((data ?? []) as TalentPoolRow[]).filter(
    (t) => !habilidadeTerm || t.skills.some((s) => s.toLowerCase().includes(habilidadeTerm))
  );

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Users className="h-5 w-5 text-accent-600" />
        <h1 className="font-display text-display-md font-semibold text-fg">Banco de Talentos</h1>
      </div>
      <p className="mt-1 text-body-sm text-fg-muted">
        Todo mundo que se cadastrou (grátis ou pago) ou se candidatou a uma vaga — {talents.length}{" "}
        {talents.length === 1 ? "registro" : "registros"}.
      </p>

      <form className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" action="/vagas-admin/talentos" method="get">
        <Input name="q" defaultValue={q} placeholder="Nome ou e-mail..." />
        <Input name="cargo" defaultValue={cargo} placeholder="Cargo desejado..." />
        <Input name="habilidade" defaultValue={habilidade} placeholder="Habilidade (ex: React)" />
        <Select name="origem" defaultValue={origem}>
          <option value="">Todas as origens</option>
          <option value="cadastro">Cadastro</option>
          <option value="candidatura_vaga">Candidatura a vaga</option>
        </Select>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-md bg-gradient-ryze px-5 py-2.5 text-body-sm font-medium text-white shadow-glow-sm transition-ryze hover:opacity-90"
          >
            Filtrar
          </button>
          {(q || cargo || habilidade || origem) && (
            <Link
              href="/vagas-admin/talentos"
              className="ml-3 text-body-sm font-medium text-fg-muted underline underline-offset-2 hover:text-fg"
            >
              Limpar filtros
            </Link>
          )}
        </div>
      </form>

      <TalentPoolTable talents={talents} jobs={jobs ?? []} />
    </div>
  );
}
