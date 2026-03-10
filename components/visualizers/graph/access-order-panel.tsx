"use client";

import type { GraphNode, GraphStep } from "@/lib/algorithms/graph";

interface AccessOrderPanelProps {
  step: GraphStep;
  nodes: GraphNode[];
  title?: string;
}

export function AccessOrderPanel({
  step,
  nodes,
  title = "Access order",
}: AccessOrderPanelProps) {
  const order =
    step.visitOrder ??
    (step.visited
      ? typeof step.visited === "object" && !(step.visited instanceof Set)
        ? Object.keys(step.visited as Record<string, unknown>)
        : Array.from(step.visited as Set<string>)
      : []);
  if (order.length === 0) return null;

  const idToLabel = new Map(nodes.map((n) => [n.id, n.label]));

  return (
    <div className="overflow-auto rounded-lg border border-border bg-zinc-900/80 p-3">
      <div className="mb-2 font-mono text-xs text-zinc-400">{title}</div>
      <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs">
        {order.map((id, i) => (
          <span key={id} className="text-text-primary">
            {i > 0 && <span className="mr-1 text-zinc-500">→</span>}
            <span className="text-accent-cyan">{idToLabel.get(id) ?? id}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
