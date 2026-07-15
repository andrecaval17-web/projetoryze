import { cn } from "@/lib/utils";

interface FoldCornerProps {
  className?: string;
  corner?: "top-right" | "top-left";
  size?: "sm" | "md";
}

const sizes = { sm: 28, md: 40 };

/**
 * Folded-corner detail for cards. Reserved for AI-driven or "match"
 * emphasis — not a generic card decoration.
 */
export function FoldCorner({
  className,
  corner = "top-right",
  size = "md",
}: FoldCornerProps) {
  const px = sizes[size];
  const flip = corner === "top-left";

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 z-10",
        flip ? "left-0" : "right-0",
        className
      )}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 40 40"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <polygon points="0,0 40,0 40,40" fill="var(--accent-500)" />
        <polygon points="0,0 40,0 20,20" fill="var(--accent-400)" />
        <polygon points="40,0 40,40 20,20" fill="var(--accent-600)" />
      </svg>
    </div>
  );
}
