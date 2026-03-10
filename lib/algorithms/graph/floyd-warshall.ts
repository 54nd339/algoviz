import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GraphConfig, GraphStep } from "./types";
import { makeStep } from "./types";

export const floydWarshallMeta: AlgorithmMeta = {
  id: "graph-floyd-warshall",
  name: "Floyd-Warshall",
  category: "graph",
  description:
    "Floyd-Warshall computes shortest paths between all pairs of vertices. Uses dynamic programming with O(V³) time. Handles negative edges but not negative cycles.",
  timeComplexity: { best: "O(V³)", average: "O(V³)", worst: "O(V³)" },
  spaceComplexity: "O(V²)",
  pseudocode: `function FloydWarshall(graph):
  dist[i][j] = weight(i,j) or ∞
  for k = 0 to |V|-1:
    for i = 0 to |V|-1:
      for j = 0 to |V|-1:
        if dist[i][k] + dist[k][j] < dist[i][j]:
          dist[i][j] = dist[i][k] + dist[k][j]`,
  relatedAlgorithms: ["graph-dijkstra", "graph-bellman-ford"],
};

registerAlgorithm(floydWarshallMeta);

export function* floydWarshall(
  config: GraphConfig,
): AlgorithmGenerator<GraphStep> {
  const { nodes, edges, directed } = config;
  const n = nodes.length;
  const nodeIndex = new Map<string, number>();
  nodes.forEach((node, i) => nodeIndex.set(node.id, i));

  const INF = 1e9;
  const dist: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)),
  );

  for (const e of edges) {
    const u = nodeIndex.get(e.source)!;
    const v = nodeIndex.get(e.target)!;
    const w = e.weight ?? 1;
    dist[u][v] = Math.min(dist[u][v], w);
    if (!directed) {
      dist[v][u] = Math.min(dist[v][u], w);
    }
  }

  let edgesExamined = 0;

  yield {
    type: "init",
    data: makeStep({
      nodes,
      edges,
      distMatrix: dist.map((r) => [...r]),
      nodesExamined: 0,
      edgesExamined: 0,
    }),
    description: `Floyd-Warshall: Initialized ${n}x${n} distance matrix`,
    codeLine: 2,
    variables: { n, totalIterations: n * n * n },
  };

  for (let k = 0; k < n; k++) {
    const kLabel = nodes[k].label;

    yield {
      type: "k-start",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(nodes.slice(0, k).map((nd) => nd.id)),
        active: new Set([nodes[k].id]),
        distMatrix: dist.map((r) => [...r]),
        floydK: k,
        nodesExamined: k,
        edgesExamined,
      }),
      description: `Considering intermediate vertex k=${kLabel}`,
      codeLine: 3,
      variables: { k: kLabel },
    };

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] === INF || dist[k][j] === INF) continue;
        edgesExamined++;

        const via = dist[i][k] + dist[k][j];
        if (via < dist[i][j]) {
          dist[i][j] = via;

          yield {
            type: "update",
            data: makeStep({
              nodes,
              edges,
              visited: new Set(nodes.slice(0, k).map((nd) => nd.id)),
              active: new Set([nodes[k].id]),
              distMatrix: dist.map((r) => [...r]),
              floydK: k,
              floydI: i,
              floydJ: j,
              nodesExamined: k,
              edgesExamined,
            }),
            description: `dist[${nodes[i].label}][${nodes[j].label}] = ${via} (via ${kLabel})`,
            codeLine: 7,
            variables: {
              i: nodes[i].label,
              j: nodes[j].label,
              k: kLabel,
              newDist: via,
            },
          };
        }
      }
    }
  }

  yield {
    type: "complete",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(nodes.map((nd) => nd.id)),
      distMatrix: dist.map((r) => [...r]),
      nodesExamined: n,
      edgesExamined,
    }),
    description: "Floyd-Warshall complete. All-pairs shortest paths computed.",
    codeLine: 7,
    variables: { totalUpdates: edgesExamined },
  };
}
