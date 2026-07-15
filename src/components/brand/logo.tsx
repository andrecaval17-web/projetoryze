import { cn } from "@/lib/utils";
import { FoldArrow } from "./fold-arrow";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

const sizes = {
  sm: { text: "text-xl", arrow: "h-5 w-4", gap: "gap-0.5" },
  md: { text: "text-2xl", arrow: "h-7 w-5", gap: "gap-1" },
  lg: { text: "text-4xl", arrow: "h-10 w-8", gap: "gap-1.5" },
};

export function Logo({ className, size = "md", showTagline = false }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <div className={cn("inline-flex items-end", s.gap)}>
        <span
          className={cn(
            "font-display font-bold uppercase tracking-tight text-fg",
            s.text
          )}
        >
          Ryze
        </span>
        <FoldArrow className={cn(s.arrow, "mb-0.5")} />
      </div>
      {showTagline && (
        <span className="text-caption uppercase tracking-wide text-fg-muted">
          Consultoria em Recursos Humanos
        </span>
      )}
    </div>
  );
}
