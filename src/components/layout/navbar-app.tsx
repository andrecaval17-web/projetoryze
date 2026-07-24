import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/social-icons";
import { signOut } from "@/app/login/actions";

/**
 * Header do painel logado — "Sua área" + "Sair", sem os links de marketing
 * do Navbar institucional (achado #1 da auditoria de UX de 2026-07-22).
 *
 * "Grupo de vagas" fica fixo aqui também (pedido de 2026-07-23) — antes o
 * link só aparecia no banner de "currículo pronto", uma vez, na primeira
 * visita à ferramenta de currículo. Mesmo link/env var do banner
 * (whatsapp-invite-banner.tsx) e do fluxo de convite (whatsapp-invite.ts) —
 * não duplica lógica, só lê a env var direto aqui (Server Component, sem
 * `"use client"`, então `process.env` funciona igual às páginas do painel).
 */
export function NavbarApp() {
  const whatsappGroupLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || null;

  return (
    <div className="flex items-center gap-2.5">
      {whatsappGroupLink && (
        <Button asChild variant="ghost" size="sm" className="h-11 border-border">
          <a href={whatsappGroupLink} target="_blank" rel="noopener noreferrer">
            <WhatsappIcon className="h-3.5 w-3.5 text-[#25D366]" />
            Grupo de vagas
          </a>
        </Button>
      )}
      <Button asChild variant="ghost" size="sm" className="h-11 border-border">
        <Link href="/para-candidatos/painel">Sua área</Link>
      </Button>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm" className="h-11 border-border">
          Sair
        </Button>
      </form>
    </div>
  );
}
