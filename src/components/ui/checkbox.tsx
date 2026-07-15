import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-start gap-2.5 text-body-sm text-fg"
      >
        <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={cn(
              "peer h-5 w-5 shrink-0 appearance-none rounded-[0.3rem] border border-border-strong bg-bg transition-ryze",
              "checked:border-accent-500 checked:bg-gradient-ryze",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          />
          <Check
            className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 scale-0 text-white transition-ryze peer-checked:scale-100"
            strokeWidth={3}
          />
        </span>
        {label}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
