import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { FoldArrow } from "@/components/brand/fold-arrow";

export const metadata: Metadata = {
  title: "Vagas — Ryze",
  robots: { index: false, follow: false },
};

/**
 * Área própria, fora do layout de `/admin` — pedido do cliente em
 * 2026-07-24 depois que a gestão de vagas cresceu demais pra caber numa
 * única página do painel geral, e depois pedido de identidade visual
 * própria (2026-07-24, segunda rodada) pra não parecer "uma aba esquecida
 * do admin". Reaproveita `requireAdmin()` (mesma autenticação/
 * `admin_users`), mas não a sidebar do `/admin`: aqui o fluxo é só
 * lista → detalhe (kanban), uma sidebar com "Dashboard/Leads/Candidatos/..."
 * não faria sentido.
 *
 * Identidade: cabeçalho escuro com o mesh de marca (mesmo `bg-mesh-ryze`
 * reservado pra "momentos com energia de IA" no design system) atrás do
 * ícone da seta, eyebrow em caixa alta rastreada e um wordmark próprio
 * ("Vagas · Sistema de Recrutamento") — read como um sistema à parte, não
 * uma página dentro do painel administrativo.
 */
export default async function VagasAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="dark min-h-[calc(100vh-4rem)] bg-bg text-fg">
      <header className="relative overflow-hidden bg-ink">
        <div className="pointer-events-none absolute inset-0 bg-mesh-ryze opacity-25" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
          <div className="flex items-center gap-3.5">
            <FoldArrow tone="solid" className="h-9 w-7" />
            <div>
              <p className="text-caption font-medium uppercase tracking-[0.2em] text-accent-400">
                Sistema de Recrutamento
              </p>
              <h1 className="font-display text-heading-lg font-bold text-white">Vagas</h1>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-neutral-300 transition-ryze hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Painel administrativo
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10">{children}</div>
    </div>
  );
}
