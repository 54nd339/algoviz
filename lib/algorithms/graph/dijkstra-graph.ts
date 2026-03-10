import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GraphConfig, GraphStep } from "./types";
import { buildAdjacencyList, makeStep } from "./types";
import { PriorityQueue } from "./utils";

export const dijkstraGraphMeta: AlgorithmMeta = {
  id: "graph-dijkstra",
  name: "Dijkstra (Graph)",
  category: "graph",
  description:
    "Dijkstra's algorithm finds shortest paths from a source to all other vertices in a weighted graph with non-negative edge weights using a priority queue.",
  timeComplexity: {
    best: "O((V+E) log V)",
    average: "O((V+E) log V)",
    worst: "O((V+E) log V)",
  },
  spaceComplexity: "O(V)",
  pseudocode: `function Dijkstra(graph, source):
  dist[source] = 0
  pq = [(0, source)]
  while pq not empty:
    (d, u) = pq.extractMin()
    if d > dist[u]: continue
    for (v, w) in adj[u]:
      if dist[u] + w < dist[v]:
        dist[v] = dist[u] + w
        pred[v] = u
        pq.insert((dist[v], v))`,
  misconceptions: [
    {
      myth: "Dijkstra works with negative edge weights",
      reality:
        "Dijkstra assumes non-negative weights. Use Bellman-Ford for graphs with negative edges.",
    },
  ],
  relatedAlgorithms: ["graph-bellman-ford", "graph-bfs", "graph-prim"],
};

registerAlgorithm(dijkstraGraphMeta);

export function* dijkstraGraph(
  config: GraphConfig,
): AlgorithmGenerator<GraphStep> {
  const { nodes, edges, directed, sourceNode } = config;
  const source = sourceNode ?? nodes[0]?.id;
  if (!source) return;

  const adj = buildAdjacencyList(nodes, edges, directed);
  const dist = new Map<string, number>();
  const pred = new Map<string, string | null>();
  const visited = new Set<string>();
  const active = new Set<string>();
  let nodesExamined = 0;
  let edgesExamined = 0;

  for (const n of nodes) {
    dist.set(n.id, Infinity);
    pred.set(n.id, null);
  }
  dist.set(source, 0);

  const pq = new PriorityQueue<string>();
  pq.push(source, 0);
  active.add(source);

  yield {
    type: "init",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(visited),
      active: new Set(active),
      distances: new Map(dist),
      predecessors: new Map(pred),
      nodesExamined,
      edgesExamined,
    }),
    description: `Dijkstra: Source = ${nodes.find((n) => n.id === source)?.label ?? source}, dist = 0`,
    codeLine: 2,
    variables: { source, dist: Object.fromEntries(dist) },
  };

  while (!pq.isEmpty()) {
    const u = pq.pop()!;
    if (visited.has(u)) continue;

    visited.add(u);
    active.delete(u);
    nodesExamined++;

    const uLabel = nodes.find((n) => n.id === u)?.label ?? u;

    yield {
      type: "extract",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(visited),
        active: new Set(active),
        distances: new Map(dist),
        predecessors: new Map(pred),
        nodesExamined,
        edgesExamined,
      }),
      description: `Extract min: ${uLabel} (dist=${dist.get(u)})`,
      codeLine: 5,
      variables: { current: uLabel, dist: dist.get(u), pqSize: pq.size },
    };

    const neighbors = adj.get(u) ?? [];
    for (const { target: v, weight: w, edgeId } of neighbors) {
      if (visited.has(v)) continue;
      edgesExamined++;

      const newDist = dist.get(u)! + w;
      const vLabel = nodes.find((n) => n.id === v)?.label ?? v;

      yield {
        type: "relax",
        data: makeStep({
          nodes,
          edges,
          visited: new Set(visited),
          active: new Set(active),
          distances: new Map(dist),
          predecessors: new Map(pred),
          currentEdge: edgeId,
          nodesExamined,
          edgesExamined,
        }),
        description: `Relax edge ${uLabel}->${vLabel}: ${dist.get(u)}+${w}=${newDist} vs ${dist.get(v) === Infinity ? "∞" : dist.get(v)}`,
        codeLine: 7,
        variables: { from: uLabel, to: vLabel, newDist, oldDist: dist.get(v) },
      };

      if (newDist < dist.get(v)!) {
        dist.set(v, newDist);
        pred.set(v, u);
        pq.push(v, newDist);
        active.add(v);
      }
    }
  }

  yield {
    type: "complete",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(visited),
      active: new Set(),
      distances: new Map(dist),
      predecessors: new Map(pred),
      nodesExamined,
      edgesExamined,
    }),
    description: `Dijkstra complete. Processed ${visited.size} nodes.`,
    codeLine: 10,
    variables: { finalDist: Object.fromEntries(dist) },
  };
}
