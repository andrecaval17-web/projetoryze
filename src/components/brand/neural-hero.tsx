import { cn } from "@/lib/utils";

/**
 * The hero backdrop: a neural network whose signals flow upward and converge
 * — the "cérebro" of the product made literal, tied to the brand's ascending
 * arrow (AI driving growth). Nodes fire on staggered loops; light travels
 * along the synapses via animated dash offsets. Concentrated toward the top
 * center so the headline stays legible over it.
 *
 * Coordinate space is 1200x680, sliced to fill. Nodes are laid out bottom
 * (many, dim) -> top (few, bright) so the eye is pulled upward to the arrow.
 */

type Node = { x: number; y: number; r: number };

// bottom rows are wide/dim inputs; top rows converge toward the crown (index 0)
const nodes: Node[] = [
  { x: 600, y: 70, r: 5 }, // 0 crown (brightest, sits under the arrow)
  { x: 470, y: 150, r: 3.5 }, // 1
  { x: 735, y: 150, r: 3.5 }, // 2
  { x: 355, y: 250, r: 3 }, // 3
  { x: 600, y: 235, r: 4 }, // 4
  { x: 850, y: 250, r: 3 }, // 5
  { x: 235, y: 360, r: 2.5 }, // 6
  { x: 470, y: 350, r: 3 }, // 7
  { x: 735, y: 355, r: 3 }, // 8
  { x: 965, y: 360, r: 2.5 }, // 9
  { x: 130, y: 480, r: 2 }, // 10
  { x: 360, y: 500, r: 2.5 }, // 11
  { x: 600, y: 470, r: 3 }, // 12
  { x: 845, y: 500, r: 2.5 }, // 13
  { x: 1070, y: 480, r: 2 }, // 14
];

// edges point generally upward, plus a few lateral "cortex" links for the brain feel
const edges: [number, number][] = [
  [1, 0], [2, 0], [4, 0],
  [3, 1], [7, 4], [8, 4], [5, 2],
  [3, 4], [5, 4], [1, 4], [2, 4],
  [6, 3], [7, 3], [8, 5], [9, 5],
  [10, 6], [11, 7], [12, 4], [12, 7], [12, 8], [13, 8], [14, 9],
  [11, 6], [13, 9], [6, 7], [8, 9],
];

export function NeuralHero({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 680"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 h-full w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="neural-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent-400)" />
          <stop offset="100%" stopColor="var(--accent-600)" />
        </radialGradient>
      </defs>

      {/* synapses — light travels along them via animated dash offset */}
      <g stroke="var(--accent-500)" fill="none" strokeLinecap="round">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            strokeWidth={1}
            strokeOpacity={0.28}
            strokeDasharray="4 12"
            style={{
              animation: `synapse-flow 2.6s linear infinite`,
              animationDelay: `${(i % 6) * -0.4}s`,
            }}
          />
        ))}
      </g>

      {/* nodes — each fires on a staggered loop */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r * 3}
            fill="var(--accent-500)"
            style={{
              transformOrigin: `${n.x}px ${n.y}px`,
              animation: `node-fire 3.4s ease-in-out infinite`,
              animationDelay: `${(i % 7) * -0.45}s`,
            }}
          />
          <circle cx={n.x} cy={n.y} r={n.r} fill="url(#neural-node)" />
        </g>
      ))}
    </svg>
  );
}
