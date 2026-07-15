"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Which icon shows is driven purely by the `dark:` CSS variant, not React
 * state — the blocking script in the root layout sets `.dark` on <html>
 * before first paint, so this needs no client state and has no hydration
 * mismatch to work around.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    localStorage.setItem("ryze-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema claro/escuro"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-fg-muted transition-ryze hover:bg-bg-surface hover:text-fg",
        className
      )}
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </button>
  );
}
