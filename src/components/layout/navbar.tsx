import Link from "next/link";
import { headers } from "next/headers";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { NavbarMenu } from "./navbar-menu";
import { NavbarApp } from "./navbar-app";
import type { NavLink } from "./nav-links";

// "Para Candidatos" is intentionally NOT here — job seekers get the dedicated
// "Sou candidato" corner button so the main nav stays B2B-focused.
// "Consultoria" e "Produtos" abrem um dropdown com as subpáginas (pedido do
// cliente em 2026-08-01: ir direto na página final sem passar pelo hub) —
// o link principal continua clicável, levando pro hub, pra quem prefere ver
// o panorama primeiro.
const navLinks: NavLink[] = [
  {
    label: "Consultoria",
    href: "/consultoria",
    items: [
      { label: "Recrutamento e Seleção", href: "/consultoria/recrutamento-e-selecao" },
      { label: "Cargos e Salários", href: "/consultoria/cargos-e-salarios" },
      { label: "Treinamento e Desenvolvimento", href: "/consultoria/treinamento-e-desenvolvimento" },
      { label: "Cultura Organizacional", href: "/consultoria/cultura-organizacional" },
    ],
  },
  {
    label: "Produtos",
    href: "/produtos",
    items: [
      { label: "Ryze Academy", href: "/produtos/academy" },
      { label: "Ryze HR Cultura", href: "/produtos/cultura" },
    ],
  },
  { label: "Sobre", href: "/sobre" },
];

/**
 * Telas de maior comprometimento (criar conta / painel logado) não devem
 * oferecer as mesmas rotas de fuga do menu institucional — achado #1 da
 * auditoria de UX de 2026-07-22. `x-pathname` vem do proxy.ts (não dá pra
 * usar usePathname() aqui porque o Navbar também precisa ler a sessão no
 * servidor, e misturar client/server só pra pathname adicionaria uma segunda
 * viagem de rede pra sessão).
 */
type NavbarVariant = "full" | "auth" | "app" | "gate";

function getVariant(pathname: string | null): NavbarVariant {
  if (!pathname) return "full";
  // Página pública de candidatura a vaga — mesma lógica de "tela de
  // formulário focada" do /cadastro/login: sem links institucionais
  // competindo com o preenchimento (aprovado pelo cliente em 2026-07-24).
  if (pathname === "/cadastro" || pathname === "/login" || pathname.startsWith("/vagas/")) return "auth";
  if (pathname.startsWith("/para-candidatos/painel")) return "app";
  // A pergunta candidato/empresa é a única decisão dessa tela — o menu
  // continua ali (não é uma tela de formulário como /cadastro), mas com
  // contraste reduzido pra não competir com os dois cards de escolha.
  if (pathname === "/") return "gate";
  return "full";
}

export async function Navbar() {
  const pathname = (await headers()).get("x-pathname");
  const variant = getVariant(pathname);

  // Server Component: lê a sessão a partir do cookie (via middleware, que já
  // a renovou) e passa só o e-mail — nunca o objeto de sessão inteiro — para
  // o Client Component que decide o que renderizar.
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Forced into the dark token scope on purpose: the navbar is graphite
  // (ink) on every page regardless of the visitor's theme, so it reads as
  // a constant brand anchor rather than dissolving into the paper bg.
  if (variant === "auth") {
    return (
      <header className="dark sticky top-0 z-50 bg-ink">
        <div className="mx-auto flex h-18 max-w-6xl items-center px-5 lg:px-8">
          <Link href="/" aria-label="Ryze — página inicial">
            <Logo size="sm" tone="dark-bg" />
          </Link>
        </div>
      </header>
    );
  }

  if (variant === "app") {
    return (
      <header className="dark sticky top-0 z-50 bg-ink">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link href="/" aria-label="Ryze — página inicial">
            <Logo size="sm" tone="dark-bg" />
          </Link>
          <NavbarApp />
        </div>
      </header>
    );
  }

  const muted = variant === "gate";

  return (
    <header className="dark sticky top-0 z-50 bg-ink">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="Ryze — página inicial">
          <Logo size="sm" tone="dark-bg" />
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-7 lg:flex",
            muted && "opacity-55 transition-ryze hover:opacity-100 focus-within:opacity-100"
          )}
          aria-label="Navegação principal"
        >
          {navLinks.map((link) =>
            link.items ? (
              // group-hover controla o dropdown só com CSS — o wrapper cobre
              // continuamente o link + o padding-top do painel, sem "buraco"
              // de mouse entre os dois (a causa mais comum de dropdown que
              // fecha sozinho antes de chegar aos itens).
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  className="flex items-center gap-1 text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
                >
                  {link.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-ryze group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-ryze group-hover:visible group-hover:opacity-100">
                  <div className="flex min-w-56 flex-col gap-1 rounded-lg border border-border bg-ink p-2 shadow-lg">
                    {link.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-md px-3 py-2 text-body-sm text-fg-muted transition-ryze hover:bg-bg-surface hover:text-fg"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <NavbarMenu navLinks={navLinks} email={user?.email ?? null} muted={muted} />
      </div>
    </header>
  );
}
