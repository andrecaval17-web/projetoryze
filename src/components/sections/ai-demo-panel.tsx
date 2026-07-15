import { Sparkles } from "lucide-react";
import { FoldMesh } from "@/components/brand/fold-mesh";

interface AiDemoPanelProps {
  label: string;
  title: string;
  children: React.ReactNode;
}

/**
 * Chrome for "IA em ação" demos on Produtos pages — the brief calls for
 * showing the AI working before listing features. This is the shared shell;
 * each product page fills `children` with its own illustrative mock.
 */
export function AiDemoPanel({ label, title, children }: AiDemoPanelProps) {
  return (
    <div className="dark relative overflow-hidden rounded-xl bg-bg-surface text-fg shadow-glow-md">
      <FoldMesh className="opacity-40" />
      <div className="relative flex items-center gap-2 border-b border-border px-6 py-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
        </span>
        <span className="text-label font-medium uppercase tracking-wider text-accent-400">
          {label}
        </span>
        <Sparkles className="ml-auto h-4 w-4 text-accent-500" />
      </div>
      <div className="relative px-6 py-8">
        <p className="mb-6 text-body-md font-medium text-fg">{title}</p>
        {children}
      </div>
    </div>
  );
}

interface MatchRowProps {
  name: string;
  role: string;
  match: number;
}

/** One candidate row for the Recrutamento IA demo — a gradient bar reading as a live match score. */
export function MatchRow({ name, role, match }: MatchRowProps) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-medium text-fg">{name}</p>
        <p className="truncate text-caption text-fg-muted">{role}</p>
      </div>
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-ryze"
          style={{ width: `${match}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-body-sm font-semibold text-gradient-ryze">
        {match}%
      </span>
    </div>
  );
}
