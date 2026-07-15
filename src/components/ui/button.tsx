import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-body font-medium transition-ryze disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-ryze text-white shadow-glow-sm hover:shadow-glow-md hover:brightness-[1.07] hover:-translate-y-px active:translate-y-0 active:brightness-95",
        secondary:
          "bg-ink text-paper shadow-sm hover:bg-neutral-800 dark:bg-neutral-100 dark:text-ink dark:hover:bg-white",
        ghost:
          "bg-transparent text-fg hover:bg-bg-surface border border-transparent hover:border-border",
      },
      size: {
        sm: "h-9 px-3.5 text-body-sm",
        md: "h-11 px-5 text-body-md",
        lg: "h-13 px-7 text-body-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref
  ) => {
    // Slot requires exactly one element child, so asChild bypasses the
    // loading spinner entirely rather than passing it as a sibling.
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
