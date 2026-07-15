import type { LucideIcon } from "lucide-react";
import { PageHero } from "./page-hero";
import { AiDemoPanel } from "./ai-demo-panel";
import { CtaBand } from "./cta-band";

interface ProductFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ProductPageTemplateProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  demoLabel: string;
  demoTitle: string;
  demoContent: React.ReactNode;
  featuresTitle: string;
  features: ProductFeature[];
  ctaTitle: string;
  ctaSubtitle?: string;
  ctaHref: string;
}

/**
 * Shared shape for Produtos subpages: the AI demo comes right after the
 * intro, before any feature list — showing the product working is the
 * brief's explicit rule for this section, not an optional nice-to-have.
 */
export function ProductPageTemplate({
  eyebrow,
  title,
  subtitle,
  demoLabel,
  demoTitle,
  demoContent,
  featuresTitle,
  features,
  ctaTitle,
  ctaSubtitle,
  ctaHref,
}: ProductPageTemplateProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <AiDemoPanel label={demoLabel} title={demoTitle}>
          {demoContent}
        </AiDemoPanel>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <h2 className="text-center font-display text-display-md font-semibold text-fg">
          {featuresTitle}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {features.map(({ icon: Icon, title: featureTitle, description }) => (
            <div key={featureTitle} className="flex gap-4 rounded-lg border border-border bg-bg-surface p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-display text-heading-sm font-semibold text-fg">{featureTitle}</h3>
                <p className="mt-1 text-body-sm text-fg-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaBand title={ctaTitle} subtitle={ctaSubtitle} ctaLabel="Falar com um consultor" ctaHref={ctaHref} tone="dark" />
    </>
  );
}
