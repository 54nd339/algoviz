"use client";

import type { GraphNode, GraphStep } from "@/lib/algorithms/graph";

interface FloydWarshallMatrixProps {
  step: GraphStep;
  nodes: GraphNode[];
}

const INF = 1e9;

export function FloydWarshallMatrix({ step, nodes }: FloydWarshallMatrixProps) {
  const { distMatrix, floydK, floydI, floydJ } = step;
  if (!distMatrix) return null;

  return (
    <div className="overflow-auto rounded-lg border border-border bg-zinc-900/80 p-3">
      <div className="mb-2 font-mono text-xs text-zinc-400">
        Distance Matrix
        {floydK !== undefined && (
          <span className="ml-2 text-cyan-400">k = {nodes[floydK]?.label}</span>
        )}
      </div>
      <table className="border-collapse font-mono text-xs">
        <thead>
          <tr>
            <th className="h-7 w-8 text-zinc-500" />
            {nodes.map((node, j) => (
              <th
                key={node.id}
                className={`h-7 w-10 text-center ${
                  floydJ === j
                    ? "bg-cyan-950/30 text-cyan-400"
                    : "text-zinc-400"
                }`}
              >
                {node.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {distMatrix.map((row, i) => (
            <tr key={nodes[i]?.id ?? i}>
              <td
                className={`h-7 w-8 text-center font-bold ${
                  floydI === i
                    ? "bg-cyan-950/30 text-cyan-400"
                    : "text-zinc-400"
                }`}
              >
                {nodes[i]?.label}
              </td>
              {row.map((val, j) => {
                const isUpdating = floydI === i && floydJ === j;
                const isKRow = floydK === i;
                const isKCol = floydK === j;

                return (
                  <td
                    key={j}
                    className={`h-7 w-10 border border-zinc-800 text-center transition-colors duration-300 ${isUpdating ? "bg-green-900/60 font-bold text-green-300" : ""} ${!isUpdating && (isKRow || isKCol) ? "bg-cyan-950/20 text-cyan-300" : ""} ${!isUpdating && !isKRow && !isKCol ? "text-zinc-300" : ""} ${i === j ? "bg-zinc-800/50" : ""} `}
                  >
                    {val >= INF ? "∞" : val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
