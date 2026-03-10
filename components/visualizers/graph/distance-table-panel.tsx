"use client";

import type { GraphNode, GraphStep } from "@/lib/algorithms/graph";

interface DistanceTablePanelProps {
  step: GraphStep;
  nodes: GraphNode[];
  title?: string;
}

const INF = 1e9;

function getDist(
  dist: Map<string, number> | Record<string, number> | null | undefined,
  id: string,
): number | undefined {
  if (dist == null) return undefined;
  if (typeof (dist as Map<string, number>).get === "function")
    return (dist as Map<string, number>).get(id);
  return (dist as Record<string, number>)[id];
}

export function DistanceTablePanel({
  step,
  nodes,
  title = "Distance table",
}: DistanceTablePanelProps) {
  const distances = step.distances;
  if (!distances) return null;

  return (
    <div className="overflow-auto rounded-lg border border-border bg-zinc-900/80 p-3">
      <div className="mb-2 font-mono text-xs text-zinc-400">{title}</div>
      <table className="w-full border-collapse font-mono text-xs">
        <thead>
          <tr>
            <th className="py-1 pr-3 text-left text-zinc-500">Node</th>
            <th className="py-1 text-right text-zinc-500">Dist</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => {
            const d = getDist(distances, node.id);
            const val =
              d === undefined ? "—" : d === Infinity || d >= INF ? "∞" : d;
            return (
              <tr key={node.id} className="border-t border-zinc-800">
                <td className="py-1 pr-3 text-accent-cyan">{node.label}</td>
                <td className="py-1 text-right text-text-primary">{val}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
