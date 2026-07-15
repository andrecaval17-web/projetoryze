import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        rows={4}
        className={cn(
          "w-full resize-y rounded-md border border-border bg-bg px-3.5 py-2.5 text-body-md text-fg transition-ryze placeholder:text-fg-muted",
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
Textarea.displayName = "Textarea";
