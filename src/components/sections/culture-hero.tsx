import { Badge } from "@/components/ui/badge";

/**
 * Culture-vs-climate banner. The insight made visual: climate is the small,
 * cool tip above the waterline (what you feel this week); culture is the
 * large faceted mass below (how things are actually done). Faceted to match
 * the brand's fold motif; the valuable depth carries the accent gradient.
 */
export function CultureHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg-surface px-5 py-16 lg:px-8 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 82% 60%, rgb(232 92 42 / 0.10), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Badge variant="accent-soft" className="mb-4">
            Cultura Organizacional
          </Badge>
          <h1 className="font-display text-display-xl font-semibold text-fg">
            Clima é o que se sente. <span className="text-gradient-ryze">Cultura</span> é o que sustenta.
          </h1>
          <p className="mt-4 max-w-xl text-body-lg text-fg-muted">
            O clima é a ponta do iceberg — muda com a semana. Cultura é a massa
            submersa: a forma como as decisões são tomadas e o trabalho é feito,
            todo dia. É essa parte, quase sempre invisível, que a Ryze desenha,
            comunica e mede.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 shrink-0 rounded-sm bg-neutral-400" />
              <span className="text-body-sm text-fg">
                <strong className="font-semibold">Clima</strong> — o que se sente hoje
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 shrink-0 rounded-sm bg-gradient-ryze" />
              <span className="text-body-sm text-fg">
                <strong className="font-semibold">Cultura</strong> — como fazemos as coisas
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <svg
            viewBox="0 0 400 380"
            className="w-full max-w-sm"
            role="img"
            aria-label="Ilustração de um iceberg: o clima é a pequena ponta acima da água, a cultura é a grande massa facetada submersa."
          >
            <defs>
              <linearGradient id="culture-mass-a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent-400)" />
                <stop offset="100%" stopColor="var(--accent-500)" />
              </linearGradient>
              <linearGradient id="culture-mass-b" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent-500)" />
                <stop offset="100%" stopColor="var(--accent-600)" />
              </linearGradient>
            </defs>

            {/* above water — climate: small, cool, neutral tip */}
            <g className="animate-float">
              <polygon points="205,96 168,150 205,150" fill="var(--neutral-300)" />
              <polygon points="205,96 242,150 205,150" fill="var(--neutral-400)" />

              {/* waterline */}
              <line
                x1="20"
                y1="152"
                x2="380"
                y2="152"
                stroke="var(--border-strong)"
                strokeWidth="1.5"
                strokeDasharray="2 6"
                strokeLinecap="round"
              />

              {/* below water — culture: large faceted mass carrying the accent */}
              <polygon points="118,150 200,150 205,340" fill="url(#culture-mass-a)" />
              <polygon points="200,150 288,150 205,340" fill="url(#culture-mass-b)" />
              <polygon points="118,150 205,340 150,250" fill="var(--accent-600)" opacity="0.35" />
              <polygon points="288,150 205,340 258,248" fill="var(--accent-400)" opacity="0.35" />
              <polygon points="200,150 205,340 205,150" fill="var(--accent-600)" opacity="0.2" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
