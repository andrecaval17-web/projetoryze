"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

interface NavbarMenuProps {
  navLinks: { label: string; href: string }[];
  /** null = deslogado. Só o e-mail chega aqui, nunca a sessão inteira. */
  email: string | null;
  /** Tela do audience gate (/) — reduz o contraste dos links institucionais
   * pra não competir com a escolha candidato/empresa. Ver navbar.tsx. */
  muted?: boolean;
}

function AuthActions({ email, variant, onNavigate }: {
  email: string | null;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const size = variant === "desktop" ? "sm" : "md";

  if (email) {
    return (
      <>
        <span className="hidden items-center gap-1.5 text-body-sm text-fg-muted lg:flex">
          <UserRound className="h-4 w-4" />
          {email}
        </span>
        {/* Mesmo canto do candidato que "Sua área" — não faz parte do menu
            institucional (ver navLinks em navbar.tsx). */}
        <Link
          href="/vagas"
          onClick={onNavigate}
          className="text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
        >
          Vagas abertas
        </Link>
        <Button asChild variant="ghost" size={size} className="border-border">
          <Link href="/para-candidatos/painel" onClick={onNavigate}>
            Sua área
          </Link>
        </Button>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size={size} className="border-border">
            Sair
          </Button>
        </form>
      </>
    );
  }

  return (
    <>
      {/* Link de login visível direto no cabeçalho — quem já tem conta não
          deveria precisar navegar até "Sou candidato" só pra achar onde
          entrar. */}
      <Link
        href="/login"
        onClick={onNavigate}
        className="text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
      >
        Entrar
      </Link>
      {/* Canto do candidato — junto de "Sou candidato", fora do menu
          institucional (navLinks em navbar.tsx é só B2B). */}
      <Link
        href="/vagas"
        onClick={onNavigate}
        className="text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
      >
        Vagas abertas
      </Link>
      {/* Candidate path, kept visually distinct from the B2B CTA so job
          seekers always have a corner to go to. */}
      <Button asChild variant="ghost" size={size} className="border-border">
        <Link href="/para-candidatos" onClick={onNavigate}>
          Sou candidato
        </Link>
      </Button>
      <Button asChild variant="primary" size={size}>
        <Link href="/contato" onClick={onNavigate}>
          Falar com especialista
        </Link>
      </Button>
    </>
  );
}

export function NavbarMenu({ navLinks, email, muted = false }: NavbarMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="hidden items-center gap-2.5 lg:flex">
        <ThemeToggle />
        <div
          className={cn(
            "flex items-center gap-2.5",
            muted && "opacity-55 transition-ryze hover:opacity-100 focus-within:opacity-100"
          )}
        >
          <AuthActions email={email} variant="desktop" />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <ThemeToggle />
        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-fg transition-ryze hover:bg-bg-surface"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          className="absolute inset-x-0 top-full border-t border-border bg-ink px-5 py-5 lg:hidden"
          aria-label="Navegação principal (mobile)"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-body-md font-medium text-fg transition-ryze hover:bg-bg-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {email && (
            <p className="mt-4 flex items-center gap-1.5 border-t border-border px-3 pt-4 text-body-sm text-fg-muted">
              <UserRound className="h-4 w-4" />
              {email}
            </p>
          )}
          <div className="mt-3 flex flex-col gap-2.5">
            <AuthActions email={email} variant="mobile" onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      )}
    </>
  );
}
