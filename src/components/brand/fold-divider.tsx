import { useId } from "react";
import { cn } from "@/lib/utils";

interface FoldDividerProps {
  className?: string;
  /** Marks a meaningful transition (e.g. into an AI-driven section) with a small accent facet. */
  emphasis?: boolean;
}

/**
 * Section divider using the brand's fold/facet crease instead of a plain hairline.
 */
export function FoldDivider({ className, emphasis = false }: FoldDividerProps) {
  const patternId = `fold-divider-${useId()}`;

  return (
    <div className={cn("relative w-full", className)} role="separator">
      <svg
        width="100%"
        height="13"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={patternId}
            width="28"
            height="13"
            patternUnits="userSpaceOnUse"
          >
            <polyline
              points="0,10 7,3 14,10 21,3 28,10"
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="13" fill={`url(#${patternId})`} />
      </svg>
      {emphasis && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <polygon points="8,1 15,8 8,15 1,8" fill="var(--bg)" />
          <polygon points="8,1 15,8 8,8" fill="var(--accent-400)" />
          <polygon points="8,1 1,8 8,8" fill="var(--accent-600)" />
        </svg>
      )}
    </div>
  );
}
