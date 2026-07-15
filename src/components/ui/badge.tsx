import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-bg-surface-2 text-fg-muted",
        outline: "border border-border-strong text-fg",
        accent: "bg-gradient-ryze text-white shadow-glow-sm",
        "accent-soft": "bg-accent-500/12 text-accent-600 dark:text-accent-400",
        recommended: "bg-gradient-ryze text-white shadow-glow-sm",
        dark: "bg-ink text-paper dark:bg-neutral-100 dark:text-ink",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
