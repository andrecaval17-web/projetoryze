"use client";

import { track } from "@vercel/analytics";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeoWhatsappLinkProps {
  href: string;
  page: string;
  serviceType: string;
}

/**
 * Client component isolado só pra registrar o clique antes de sair pro
 * WhatsApp — o resto do GeoPageTemplate continua Server Component. Evento
 * de clique, não formulário: não grava nada em `leads`, só conta no Vercel
 * Analytics quantos cliques cada página geo gera.
 */
export function GeoWhatsappLink({ href, page, serviceType }: GeoWhatsappLinkProps) {
  return (
    <Button asChild size="lg" variant="secondary">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("whatsapp_click", { page, serviceType })}
      >
        <MessageCircle className="h-4 w-4" />
        Falar no WhatsApp
      </a>
    </Button>
  );
}
