import { Quote } from "lucide-react";

interface ProofBlockProps {
  stat: { value: string; label: string };
  quote: string;
  author: string;
  role: string;
}

/**
 * The "prova social" beat of a Consultoria service page: one number that
 * shows outcome, one quote that shows trust. Illustrative content — swap
 * for real client numbers/testimonials before launch.
 */
export function ProofBlock({ stat, quote, author, role }: ProofBlockProps) {
  return (
    <div className="grid gap-8 rounded-xl border border-border bg-bg-surface p-8 sm:grid-cols-[auto_1fr] sm:p-10">
      <div className="flex flex-col justify-center border-b border-border pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-10">
        <span className="font-display text-display-lg font-semibold text-gradient-ryze">
          {stat.value}
        </span>
        <span className="mt-1 max-w-[12rem] text-body-sm text-fg-muted">{stat.label}</span>
      </div>
      <div className="flex flex-col justify-center">
        <Quote className="h-6 w-6 text-accent-500/50" />
        <p className="mt-3 text-body-lg text-fg">&ldquo;{quote}&rdquo;</p>
        <p className="mt-4 text-body-sm font-medium text-fg-muted">
          {author} <span className="text-fg-muted/70">— {role}</span>
        </p>
      </div>
    </div>
  );
}
