"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// "Para Candidatos" is intentionally NOT here — job seekers get the dedicated
// "Sou candidato" corner button so the main nav stays B2B-focused.
const navLinks = [
  { label: "Consultoria", href: "/consultoria" },
  { label: "Produtos", href: "/produtos" },
  { label: "Sobre", href: "/sobre" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    // Forced into the dark token scope on purpose: the navbar is graphite
    // (ink) on every page regardless of the visitor's theme, so it reads as
    // a constant brand anchor rather than dissolving into the paper bg.
    <header className="dark sticky top-0 z-50 bg-ink">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="Ryze — página inicial" onClick={() => setOpen(false)}>
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          {/* Candidate path, kept visually distinct from the B2B CTA so job
              seekers always have a corner to go to. */}
          <Button asChild variant="ghost" size="sm" className="border-border">
            <Link href="/para-candidatos">Sou candidato</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/contato">Falar com especialista</Link>
          </Button>
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
      </div>

      {open && (
        <nav
          className="border-t border-border bg-ink px-5 py-5 lg:hidden"
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
          <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4">
            <Button asChild variant="ghost" size="md" className="border-border">
              <Link href="/para-candidatos" onClick={() => setOpen(false)}>
                Sou candidato
              </Link>
            </Button>
            <Button asChild variant="primary" size="md">
              <Link href="/contato" onClick={() => setOpen(false)}>
                Falar com especialista
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
