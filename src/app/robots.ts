import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
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
