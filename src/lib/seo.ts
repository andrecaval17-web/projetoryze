import type { Metadata } from "next";
import { getSiteUrl } from "./site-url";

// Logo real (874×426, ver src/components/brand/logo.tsx) usado como imagem
// de Open Graph padrão — não existe ainda uma arte de compartilhamento
// dedicada (1200×630) pras páginas institucionais.
const DEFAULT_OG_IMAGE = { url: "/brand/ryze-logo.png", width: 874, height: 426, alt: "Ryze" };

/**
 * Título, descrição, canonical e Open Graph/Twitter Card num único lugar —
 * usado pelas páginas institucionais principais (produtos, empresas,
 * consultoria) pra não repetir a mesma forma 9 vezes.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImageAlt,
}: {
  title: string;
  description: string;
  path: string;
  /** Alt localizado da imagem de compartilhamento — ex: "Currículo Grátis com IA em Vitória, ES" nas páginas geo. Default "Ryze". */
  ogImageAlt?: string;
}): Metadata {
  const url = `${getSiteUrl()}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Ryze",
      locale: "pt_BR",
      type: "website",
      images: [{ ...DEFAULT_OG_IMAGE, alt: ogImageAlt ?? DEFAULT_OG_IMAGE.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}
