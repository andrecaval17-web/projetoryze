import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full rounded-md border border-border bg-bg px-3.5 text-body-md text-fg transition-ryze placeholder:text-fg-muted",
          "focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-error focus-visible:border-error focus-visible:ring-error/25",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
