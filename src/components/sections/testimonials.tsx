import { Star } from "lucide-react";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** Optional outcome tag, e.g. "Recolocada em 6 semanas". */
  result?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

interface TestimonialsProps {
  title: string;
  subtitle?: string;
  items: Testimonial[];
  tone?: "light" | "surface";
}

/**
 * Social-proof section. NOTE: content passed in may be placeholder/example
 * copy — real, verifiable testimonials must replace it before going live
 * (fabricated testimonials presented as real are deceptive advertising).
 */
export function Testimonials({ title, subtitle, items, tone = "surface" }: TestimonialsProps) {
  return (
    <section
      className={
        tone === "surface"
          ? "border-y border-border bg-bg-surface px-5 py-16 lg:px-8"
          : "px-5 py-16 lg:px-8"
      }
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-md font-semibold text-fg">{title}</h2>
          {subtitle && <p className="mt-3 text-body-lg text-fg-muted">{subtitle}</p>}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-lg border border-border bg-bg p-6 shadow-sm"
            >
              <div className="mb-3 flex gap-0.5 text-accent-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="flex-1 text-body-md text-fg">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              {t.result && (
                <span className="mt-4 inline-flex w-fit rounded-full bg-accent-500/10 px-3 py-1 text-label font-medium text-accent-600 dark:text-accent-400">
                  {t.result}
                </span>
              )}
              <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-ryze text-body-sm font-semibold text-white">
                  {initials(t.name)}
                </span>
                <span className="flex flex-col">
                  <span className="text-body-sm font-semibold text-fg">{t.name}</span>
                  <span className="text-caption text-fg-muted">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
