import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // `allow: "/"` já libera as páginas geo (/[tipo]/[uf]/[cidade]) por
      // padrão — não precisam de regra própria, só não podem cair numa das
      // entradas abaixo.
      allow: "/",
      disallow: [
        "/admin",
        "/vagas-admin",
        "/api",
        "/design-system",
        "/para-candidatos/painel",
        "/abertura-de-vaga",
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
