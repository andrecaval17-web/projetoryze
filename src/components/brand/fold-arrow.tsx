import { useId } from "react";
import { cn } from "@/lib/utils";

export type FoldArrowTone = "gradient" | "solid" | "current";

interface FoldArrowProps extends React.SVGAttributes<SVGSVGElement> {
  tone?: FoldArrowTone;
}

/**
 * The Ryze brand mark: an ascending arrow built from paper-fold facets.
 * Each half of the arrowhead and shaft is a separate facet so the piece
 * reads as folded metal/paper rather than a flat glyph.
 */
export function FoldArrow({
  tone = "gradient",
  className,
  ...props
}: FoldArrowProps) {
  const idBase = `fold-arrow-${useId()}`;

  if (tone === "current") {
    return (
      <svg
        viewBox="0 0 64 88"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-8 w-6", className)}
        aria-hidden="true"
        {...props}
      >
        <polygon points="32,2 8,38 32,38" opacity="0.85" />
        <polygon points="32,2 56,38 32,38" />
        <polygon points="22,38 32,38 32,86 22,86" opacity="0.85" />
        <polygon points="32,38 42,38 42,86 32,86" />
      </svg>
    );
  }

  if (tone === "solid") {
    return (
      <svg
        viewBox="0 0 64 88"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-8 w-6", className)}
        aria-hidden="true"
        {...props}
      >
        <polygon points="32,2 8,38 32,38" fill="var(--accent-400)" />
        <polygon points="32,2 56,38 32,38" fill="var(--accent-600)" />
        <polygon points="22,38 32,38 32,86 22,86" fill="var(--accent-400)" />
        <polygon points="32,38 42,38 42,86 32,86" fill="var(--accent-600)" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 88"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-6", className)}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={`${idBase}-left`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-400)" />
          <stop offset="100%" stopColor="var(--accent-500)" />
        </linearGradient>
        <linearGradient id={`${idBase}-right`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-500)" />
          <stop offset="100%" stopColor="var(--accent-600)" />
        </linearGradient>
      </defs>
      <polygon points="32,2 8,38 32,38" fill={`url(#${idBase}-left)`} />
      <polygon points="32,2 56,38 32,38" fill={`url(#${idBase}-right)`} />
      <polygon
        points="22,38 32,38 32,86 22,86"
        fill={`url(#${idBase}-left)`}
      />
      <polygon
        points="32,38 42,38 42,86 32,86"
        fill={`url(#${idBase}-right)`}
      />
    </svg>
  );
}
