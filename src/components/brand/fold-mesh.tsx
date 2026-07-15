import { cn } from "@/lib/utils";

interface FoldMeshProps {
  className?: string;
}

/**
 * Large-scale faceted backdrop — the origami-fold motif blown up into an
 * ambient texture instead of a small icon. Facets cluster at the edges and
 * thin out toward the center so foreground text stays legible. Meant for
 * dark, AI-forward sections (hero, product highlights), not tiled globally.
 */
export function FoldMesh({ className }: FoldMeshProps) {
  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 h-full w-full", className)}
      aria-hidden="true"
    >
      {/* structural facets — set the depth/shadow layer */}
      <polygon points="0,0 300,0 0,260" fill="var(--neutral-800)" opacity="0.55" />
      <polygon points="1200,0 900,0 1200,240" fill="var(--neutral-800)" opacity="0.55" />
      <polygon points="0,600 260,600 0,360" fill="var(--neutral-800)" opacity="0.5" />
      <polygon points="1200,600 960,600 1200,380" fill="var(--neutral-800)" opacity="0.5" />

      {/* accent facets — the "glow" layer, breathing slowly like an active process */}
      <g
        className="origin-[130px_150px] animate-[fold-pulse_7s_ease-in-out_infinite]"
        style={{ animationDelay: "0s" }}
      >
        <polygon points="0,0 300,0 130,220" fill="var(--accent-500)" opacity="0.22" />
      </g>
      <polygon points="300,0 480,0 220,190" fill="var(--accent-400)" opacity="0.14" />
      <g
        className="origin-[1060px_150px] animate-[fold-pulse_8s_ease-in-out_infinite]"
        style={{ animationDelay: "1.5s" }}
      >
        <polygon points="1200,0 900,0 1060,230" fill="var(--accent-600)" opacity="0.22" />
      </g>
      <polygon points="900,0 760,0 1000,180" fill="var(--accent-400)" opacity="0.12" />

      <polygon points="0,600 300,600 140,400" fill="var(--accent-600)" opacity="0.18" />
      <g
        className="origin-[1050px_500px] animate-[fold-pulse_9s_ease-in-out_infinite]"
        style={{ animationDelay: "3s" }}
      >
        <polygon points="1200,600 900,600 1070,410" fill="var(--accent-500)" opacity="0.2" />
      </g>
      <polygon points="380,600 520,600 420,470" fill="var(--accent-400)" opacity="0.1" />

      {/* thin scattered slivers for texture without crowding the center */}
      <polygon points="60,300 160,260 150,360" fill="var(--accent-400)" opacity="0.08" />
      <polygon points="1140,300 1040,260 1050,360" fill="var(--accent-500)" opacity="0.08" />
    </svg>
  );
}
