import Link from "next/link";
import type { Metadata } from "next";
import { LayoutDashboard, Users, UserCog, Sparkles, CalendarCheck, ShieldCheck, Briefcase } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin — Ryze",
  robots: { index: false, follow: false },
};

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, ownerOnly: false },
  { href: "/admin/leads", label: "Leads", icon: Users, ownerOnly: false },
  { href: "/admin/candidatos", label: "Candidatos", icon: UserCog, ownerOnly: false },
  { href: "/vagas-admin", label: "Vagas", icon: Briefcase, ownerOnly: false },
  { href: "/admin/ia", label: "Custo de IA", icon: Sparkles, ownerOnly: false },
  { href: "/admin/mentoria", label: "Mentoria", icon: CalendarCheck, ownerOnly: false },
  { href: "/admin/equipe", label: "Equipe", icon: ShieldCheck, ownerOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Verificação central — toda página admin passa por aqui antes de
  // renderizar qualquer coisa. Server Actions individuais chamam
  // requireAdmin()/requireOwner() de novo no próprio corpo, já que uma
  // Server Action não re-executa o layout.
  const session = await requireAdmin();

  return (
    <div className="dark mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl bg-bg text-fg">
      <aside className="w-56 shrink-0 border-r border-border px-4 py-8">
        <p className="mb-6 px-3 text-caption font-medium uppercase tracking-wide text-fg-muted">
          Painel administrativo
        </p>
        <nav className="flex flex-col gap-1">
          {navItems
            .filter((item) => !item.ownerOnly || session.role === "owner")
            .map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-body-sm font-medium text-fg-muted transition-ryze hover:bg-bg-surface hover:text-fg"
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </Link>
            ))}
        </nav>
      </aside>
      <div className="flex-1 px-8 py-10">{children}</div>
    </div>
  );
}
