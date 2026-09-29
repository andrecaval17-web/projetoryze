import Link from "next/link";
import { ArrowRight, MessageCircle, Check } from "lucide-react";
import { PageHero } from "./page-hero";
import { CtaBand } from "./cta-band";
import { ResultsBand } from "./results-band";
import { Button } from "@/components/ui/button";
import { GEO_PAGE_TYPES, type GeoPageType } from "@/lib/geo/page-types";
import type { GeoCity } from "@/lib/geo/cities";
import { WHATSAPP_NUMBER, buildContactWhatsappHref } from "@/lib/whatsapp-number";
import { getSiteUrl } from "@/lib/site-url";

interface GeoPageTemplateProps {
  city: GeoCity;
  pageType: GeoPageType;
  /** Todas as cidades ativas (já sem a atual) — usadas na seção "em outras cidades". */
  otherCities: GeoCity[];
}

const MAX_RELATED_CITIES = 8;

/**
 * Template único para todo o cluster geo (`/[tipo]/[uf]/[cidade]`) — os 4
 * tipos da Fase 1 e qualquer tipo futuro renderizam por aqui, variando só o
 * conteúdo de `GeoPageType`. Reaproveita o design system institucional
 * (PageHero, CtaBand, Button) — não é um microsite à parte.
 *
 * As duas seções de links no fim (mesmo tipo em outras cidades / outros
 * tipos na mesma cidade) são o que transforma isso numa malha rastreável em
 * vez de páginas soltas — nunca remover sem substituir por outra forma de
 * interlinking.
 */
export function GeoPageTemplate({ city, pageType, otherCities }: GeoPageTemplateProps) {
  const uf = city.uf.toUpperCase();
  const h1 = pageType.buildH1(city);
  const pageUrl = `${getSiteUrl()}/${pageType.slug}/${city.uf}/${city.slug}`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pageType.buildWhatsappMessage(city))}`;

  // B2B (audience "b2b") sempre teve ctaHref "/contato" — formulário que
  // vinha falhando no envio (erro reportado pelo André em 2026-08-12).
  // Nesses casos o CTA principal passa a ir direto para o WhatsApp, com
  // mensagem contextualizada pela página/cidade, e o botão secundário
  // "Falar no WhatsApp" (que já fazia a mesma coisa) some pra não duplicar.
  const isContatoCta = pageType.ctaHref === "/contato";
  const primaryHref = isContatoCta
    ? buildContactWhatsappHref(`${pageType.label} em ${city.name}, ${uf}`)
    : pageType.ctaHref;

  const relatedCities = otherCities
    .filter((c) => !(c.uf === city.uf && c.slug === city.slug))
    .slice(0, MAX_RELATED_CITIES);

  // Nunca cruza B2C e B2B na mesma malha — um card de "Currículo Grátis"
  // não faz sentido na página de Recrutamento e Seleção, e vice-versa. Um
  // tipo ainda "prototype" (em revisão) só entra na malha na própria cidade
  // protótipo (Vitória/ES) — senão toda página já publicada passaria a
  // linkar pra um tipo que só existe numa cidade, gerando 83 pares de link
  // "morto" (sem conteúdo pré-renderado nem no sitemap) espalhados pelo site.
  const isPrototypeCity = city.uf === "es" && city.slug === "vitoria";
  const otherTypesSameCity = GEO_PAGE_TYPES.filter(
    (t) =>
      t.slug !== pageType.slug &&
      t.audience === pageType.audience &&
      (t.status === "batch" || isPrototypeCity)
  );

  // Service, não LocalBusiness — ver comentário em lib/geo/page-types.ts.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: pageType.serviceType,
    name: h1,
    description: pageType.buildDescription(city),
    url: pageUrl,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "State",
        name: city.ufName,
      },
    },
    provider: {
      "@type": "Organization",
      name: "Ryze",
      url: getSiteUrl(),
    },
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero eyebrow={pageType.eyebrow} title={h1} subtitle={pageType.buildIntro(city)}>
        <Button asChild size="lg">
          {isContatoCta ? (
            <a href={primaryHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              {pageType.ctaLabel}
            </a>
          ) : (
            <Link href={primaryHref}>{pageType.ctaLabel}</Link>
          )}
        </Button>
        {!isContatoCta && (
          <Button asChild size="lg" variant="secondary">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </Button>
        )}
      </PageHero>

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <h2 className="font-display text-display-md font-semibold text-fg">
          Como funciona em {city.name}
        </h2>
        <ul className="mt-6 flex flex-col gap-4">
          {pageType.buildBenefits(city).map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-body-lg text-fg-muted">
              <Check className="mt-1 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      {pageType.results && pageType.results.length > 0 && (
        <ResultsBand
          title={`Por que isso importa para empresas em ${city.name}`}
          subtitle="Dados de mercado que sustentam nossa forma de trabalhar — nunca resultado de cliente inventado."
          stats={pageType.results}
        />
      )}

      {relatedCities.length > 0 && (
        <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-heading-lg font-semibold text-fg">
              {pageType.shortLabel} em outras cidades
            </h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {relatedCities.map((c) => (
                <li key={`${c.uf}-${c.slug}`}>
                  <Link
                    href={`/${pageType.slug}/${c.uf}/${c.slug}`}
                    className="group flex items-center gap-1.5 rounded-full border border-border bg-bg px-4 py-2 text-body-sm text-fg transition-ryze hover:border-accent-500/40 hover:text-accent-600 dark:hover:text-accent-400"
                  >
                    {pageType.shortLabel} em {c.name}, {c.uf.toUpperCase()}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-ryze group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <h2 className="font-display text-heading-lg font-semibold text-fg">
          Outros serviços em {city.name}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {otherTypesSameCity.map((type) => (
            <Link
              key={type.slug}
              href={`/${type.slug}/${city.uf}/${city.slug}`}
              className="group flex flex-col rounded-lg border border-border bg-bg-surface p-5 transition-ryze hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-md"
            >
              <span className="font-display text-heading-sm font-semibold text-fg">{type.label}</span>
              <span className="mt-1 flex items-center gap-1 text-body-sm text-fg-muted">
                em {city.name}, {uf}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-ryze group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand
        title={`Pronto para começar em ${city.name}?`}
        subtitle={pageType.buildDescription(city)}
        ctaLabel={pageType.ctaLabel}
        ctaHref={primaryHref}
        tone="dark"
      />
    </>
  );
}
