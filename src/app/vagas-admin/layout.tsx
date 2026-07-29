import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users, FileEdit } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { FoldArrow } from "@/components/brand/fold-arrow";

export const metadata: Metadata = {
  title: "Vagas — Ryze",
  robots: { index: false, follow: false },
};

/**
 * Área própria, fora do layout de `/admin` — pedido do cliente em
 * 2026-07-24 depois que a gestão de vagas cresceu demais pra caber numa
 * única página do painel geral. Reaproveita `requireAdmin()` (mesma
 * autenticação/`admin_users`), mas não a sidebar do `/admin`.
 *
 * Identidade: originalmente essa área toda era escura (tema `.dark`
 * forçado). O cliente pediu claro pro kanban/modal numa rodada, e depois
 * pediu claro pro resto também (2026-07-24, quarta rodada — a mistura
 * clara/escura ficou "pesada demais"). Agora é clara de ponta a ponta;
 * a identidade de marca fica só no ícone da seta e no eyebrow laranja,
 * sem depender de fundo escuro.
 *
 * `.light` (não só a ausência de `.dark`) é proposital: sem isso, a área
 * herdaria o tema global do site (alternado pelo visitante, persistido em
 * `html.dark`) — se a pessoa estivesse no modo escuro do site, o ATS
 * voltaria a ficar escuro por baixo dos panos. `.light` força claro
 * independente disso, igual o `.dark` força escuro no `/admin`.
 */
export default async function VagasAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="light min-h-[calc(100vh-4rem)] bg-bg text-fg">
      <header className="relative overflow-hidden border-b border-border bg-bg-surface">
        <div className="pointer-events-none absolute inset-0 bg-mesh-ryze opacity-10" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
          <div className="flex items-center gap-3.5">
            <FoldArrow tone="gradient" className="h-9 w-7" />
            <div>
              <p className="text-caption font-medium uppercase tracking-[0.2em] text-accent-600">
                Sistema de Recrutamento
              </p>
              <h1 className="font-display text-heading-lg font-bold text-fg">Vagas</h1>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/vagas-admin/aberturas"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
            >
              <FileEdit className="h-3.5 w-3.5" /> Aberturas de Vaga
            </Link>
            <Link
              href="/vagas-admin/talentos"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
            >
              <Users className="h-3.5 w-3.5" /> Banco de Talentos
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Painel administrativo
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10">{children}</div>
    </div>
  );
}
