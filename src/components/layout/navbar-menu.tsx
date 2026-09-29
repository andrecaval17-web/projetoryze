"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, UserRound, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";
import { buildContactWhatsappHref } from "@/lib/whatsapp-number";
import type { NavLink } from "./nav-links";

interface NavbarMenuProps {
  navLinks: NavLink[];
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
        {/* Redireciona pro WhatsApp em vez do formulário /contato (que só
            grava o lead sem notificar ninguém) — mesmo padrão aplicado em
            footer/produtos/geo em 2026-08-12, faltava aqui (2026-09-03). */}
        <a
          href={buildContactWhatsappHref("os serviços da Ryze")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
        >
          Falar com especialista
        </a>
      </Button>
    </>
  );
}

/**
 * Sem hover no toque — o rótulo navega direto pro hub (Consultoria/Produtos),
 * e a seta é um alvo de toque separado que só expande/recolhe as subpáginas.
 * Evita o dilema "o toque abre ou navega?" que travaria um dos dois.
 */
function MobileNavItem({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);

  if (!link.items) {
    return (
      <li>
        <Link
          href={link.href}
          onClick={onNavigate}
          className="block rounded-md px-3 py-2.5 text-body-md font-medium text-fg transition-ryze hover:bg-bg-surface"
        >
          {link.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center">
        <Link
          href={link.href}
          onClick={onNavigate}
          className="flex-1 rounded-md px-3 py-2.5 text-body-md font-medium text-fg transition-ryze hover:bg-bg-surface"
        >
          {link.label}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Fechar" : "Abrir"} submenu de ${link.label}`}
          className="rounded-md p-2.5 text-fg-muted transition-ryze hover:bg-bg-surface hover:text-fg"
        >
          <ChevronDown className={cn("h-4 w-4 transition-ryze", expanded && "rotate-180")} />
        </button>
      </div>
      {expanded && (
        <ul className="ml-3 flex flex-col gap-0.5 border-l border-border py-1 pl-3">
          {link.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="block rounded-md px-3 py-2 text-body-sm text-fg-muted transition-ryze hover:bg-bg-surface hover:text-fg"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
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
              <MobileNavItem key={link.href} link={link} onNavigate={() => setOpen(false)} />
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
