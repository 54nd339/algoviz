import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GraphConfig, GraphStep } from "./types";
import { makeStep } from "./types";

export const bellmanFordMeta: AlgorithmMeta = {
  id: "graph-bellman-ford",
  name: "Bellman-Ford",
  category: "graph",
  description:
    "Bellman-Ford finds shortest paths from a source to all vertices, handling negative edge weights. Detects negative cycles in V iterations.",
  timeComplexity: { best: "O(V·E)", average: "O(V·E)", worst: "O(V·E)" },
  spaceComplexity: "O(V)",
  pseudocode: `function BellmanFord(graph, source):
  dist[source] = 0
  for i = 1 to |V|-1:
    for each edge (u, v, w):
      if dist[u] + w < dist[v]:
        dist[v] = dist[u] + w
        pred[v] = u
  // Check for negative cycles
  for each edge (u, v, w):
    if dist[u] + w < dist[v]:
      return "Negative cycle detected"`,
  misconceptions: [
    {
      myth: "Bellman-Ford is always slower than Dijkstra",
      reality:
        "Bellman-Ford handles negative weights which Dijkstra cannot. Its V-1 pass guarantee is needed for correctness with negative edges.",
    },
  ],
  relatedAlgorithms: ["graph-dijkstra", "graph-floyd-warshall"],
};

registerAlgorithm(bellmanFordMeta);

export function* bellmanFord(
  config: GraphConfig,
): AlgorithmGenerator<GraphStep> {
  const { nodes, edges, directed, sourceNode } = config;
  const source = sourceNode ?? nodes[0]?.id;
  if (!source) return;

  const dist = new Map<string, number>();
  const pred = new Map<string, string | null>();
  const visited = new Set<string>();
  let nodesExamined = 0;
  let edgesExamined = 0;

  for (const n of nodes) {
    dist.set(n.id, Infinity);
    pred.set(n.id, null);
  }
  dist.set(source, 0);
  visited.add(source);

  yield {
    type: "init",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(visited),
      distances: new Map(dist),
      predecessors: new Map(pred),
      nodesExamined,
      edgesExamined,
    }),
    description: `Bellman-Ford: Source = ${nodes.find((n) => n.id === source)?.label ?? source}`,
    codeLine: 2,
    variables: { source, passes: nodes.length - 1 },
  };

  const allEdges = directed
    ? edges
    : edges.flatMap((e) => [
        e,
        { ...e, id: `${e.id}-rev`, source: e.target, target: e.source },
      ]);

  for (let i = 0; i < nodes.length - 1; i++) {
    let updated = false;

    for (const e of allEdges) {
      const u = e.source;
      const v = e.target;
      const w = e.weight ?? 1;
      edgesExamined++;

      if (dist.get(u)! === Infinity) continue;

      const newDist = dist.get(u)! + w;
      const uLabel = nodes.find((n) => n.id === u)?.label ?? u;
      const vLabel = nodes.find((n) => n.id === v)?.label ?? v;

      if (newDist < dist.get(v)!) {
        dist.set(v, newDist);
        pred.set(v, u);
        visited.add(v);
        updated = true;

        yield {
          type: "relax",
          data: makeStep({
            nodes,
            edges,
            visited: new Set(visited),
            active: new Set([v]),
            distances: new Map(dist),
            predecessors: new Map(pred),
            currentEdge: e.id.replace("-rev", ""),
            nodesExamined,
            edgesExamined,
          }),
          description: `Pass ${i + 1}: Relaxed ${uLabel}->${vLabel}, dist=${newDist}`,
          codeLine: 6,
          variables: { pass: i + 1, from: uLabel, to: vLabel, newDist },
        };
      }
    }

    nodesExamined++;

    yield {
      type: "pass-complete",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(visited),
        distances: new Map(dist),
        predecessors: new Map(pred),
        nodesExamined,
        edgesExamined,
      }),
      description: `Pass ${i + 1}/${nodes.length - 1} complete${updated ? "" : " (no changes)"}`,
      codeLine: 3,
      variables: { pass: i + 1, updated },
    };

    if (!updated) break;
  }

  // Negative cycle check
  let negativeCycle = false;
  for (const e of allEdges) {
    const u = e.source;
    const v = e.target;
    const w = e.weight ?? 1;
    if (dist.get(u)! !== Infinity && dist.get(u)! + w < dist.get(v)!) {
      negativeCycle = true;
      break;
    }
  }

  yield {
    type: "complete",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(visited),
      distances: new Map(dist),
      predecessors: new Map(pred),
      negativeCycle,
      nodesExamined,
      edgesExamined,
    }),
    description: negativeCycle
      ? "Negative cycle detected! Shortest paths undefined."
      : `Bellman-Ford complete. All shortest paths found.`,
    codeLine: negativeCycle ? 10 : 7,
    variables: { negativeCycle, finalDist: Object.fromEntries(dist) },
  };
}
