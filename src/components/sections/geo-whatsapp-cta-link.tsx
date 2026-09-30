"use client";

interface GeoWhatsappCtaLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  pageType: string;
  uf: string;
  citySlug: string;
  pagePath: string;
}

/**
 * Mesmo `<a>` de sempre pro CTA de WhatsApp das páginas geo (href, target,
 * rel e aparência intocados) — só acrescenta um beacon best-effort no
 * clique, registrado em `geo_whatsapp_clicks`. `sendBeacon` (com fallback
 * pra `fetch(..., { keepalive: true })`) é fire-and-forget: não bloqueia
 * nem atrasa a navegação pro wa.me, e qualquer falha (endpoint fora do ar,
 * tabela ainda sem a migration em produção, o que for) é engolida aqui —
 * nunca pode quebrar o clique real.
 */
export function GeoWhatsappCtaLink({
  pageType,
  uf,
  citySlug,
  pagePath,
  onClick,
  ...anchorProps
}: GeoWhatsappCtaLinkProps) {
  return (
    <a
      {...anchorProps}
      onClick={(event) => {
        try {
          const payload = JSON.stringify({
            page_type: pageType,
            uf,
            city_slug: citySlug,
            page_path: pagePath,
          });
          if (typeof navigator.sendBeacon === "function") {
            navigator.sendBeacon("/api/geo-whatsapp-click", new Blob([payload], { type: "application/json" }));
          } else {
            fetch("/api/geo-whatsapp-click", {
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
