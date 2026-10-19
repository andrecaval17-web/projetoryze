"use client";

import { usePathname } from "next/navigation";
import type { WhatsappClickButton } from "@/lib/whatsapp-click";

interface WhatsappClickLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  button: WhatsappClickButton;
}

/**
 * Mesmo `<a>` de sempre pra qualquer botão de WhatsApp do site (href,
 * target, rel e aparência intocados — passe o que já usava via props) — só
 * acrescenta um beacon best-effort no clique, registrado em
 * `whatsapp_clicks` com a página atual (via usePathname) e qual botão foi
 * esse. `sendBeacon` (com fallback pra `fetch(..., { keepalive: true })`) é
 * fire-and-forget: não bloqueia nem atrasa a navegação pro wa.me, e
 * qualquer falha (endpoint fora do ar, tabela sem a migration em produção
 * ainda, o que for) é engolida aqui — nunca pode quebrar o clique real.
 */
export function WhatsappClickLink({ button, onClick, ...anchorProps }: WhatsappClickLinkProps) {
  const pagePath = usePathname();

  return (
    <a
      {...anchorProps}
      onClick={(event) => {
        try {
          const payload = JSON.stringify({ button, page_path: pagePath });
          if (typeof navigator.sendBeacon === "function") {
            navigator.sendBeacon("/api/whatsapp-click", new Blob([payload], { type: "application/json" }));
          } else {
            fetch("/api/whatsapp-click", {
              method: "POST",
              body: payload,
              headers: { "Content-Type": "application/json" },
              keepalive: true,
            }).catch(() => {});
          }
        } catch {
          // best-effort — nunca impede o clique de abrir o WhatsApp
        }
        onClick?.(event);
      }}
    />
  );
}
