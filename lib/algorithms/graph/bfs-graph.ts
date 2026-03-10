import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GraphConfig, GraphStep } from "./types";
import { buildAdjacencyList, makeStep } from "./types";

export const bfsGraphMeta: AlgorithmMeta = {
  id: "graph-bfs",
  name: "BFS (Graph)",
  category: "graph",
  description:
    "Breadth-First Search explores a graph level by level from a source node using a FIFO queue. Finds shortest paths in unweighted graphs.",
  timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
  spaceComplexity: "O(V)",
  pseudocode: `function BFS(graph, source):
  queue = [source]
  visited = {source}
  while queue not empty:
    node = queue.dequeue()
    for neighbor in adj[node]:
      if neighbor not in visited:
        visited.add(neighbor)
        queue.enqueue(neighbor)`,
  relatedAlgorithms: ["graph-dfs", "graph-dijkstra"],
};

registerAlgorithm(bfsGraphMeta);

export function* bfsGraph(config: GraphConfig): AlgorithmGenerator<GraphStep> {
  const { nodes, edges, directed, sourceNode } = config;
  const source = sourceNode ?? nodes[0]?.id;
  if (!source) return;

  const adj = buildAdjacencyList(nodes, edges, directed);
  const visited = new Set<string>();
  const active = new Set<string>();
  const visitOrder: string[] = [];
  const queue: string[] = [];
  let nodesExamined = 0;
  let edgesExamined = 0;

  visited.add(source);
  active.add(source);
  queue.push(source);
  visitOrder.push(source);

  yield {
    type: "init",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(visited),
      active: new Set(active),
      visitOrder: [...visitOrder],
      nodesExamined,
      edgesExamined,
    }),
    description: `BFS: Starting from node ${nodes.find((n) => n.id === source)?.label ?? source}`,
    codeLine: 2,
    variables: { source, queueSize: 1 },
  };

  while (queue.length > 0) {
    const current = queue.shift()!;
    active.delete(current);
    nodesExamined++;

    const neighbors = adj.get(current) ?? [];

    for (const { target, edgeId } of neighbors) {
      edgesExamined++;

      yield {
        type: "examine-edge",
        data: makeStep({
          nodes,
          edges,
          visited: new Set(visited),
          active: new Set(active),
          visitOrder: [...visitOrder],
          currentEdge: edgeId,
          nodesExamined,
          edgesExamined,
        }),
        description: `Examining edge to ${nodes.find((n) => n.id === target)?.label ?? target}`,
        codeLine: 5,
        variables: { current, neighbor: target, queueSize: queue.length },
      };

      if (!visited.has(target)) {
        visited.add(target);
        active.add(target);
        queue.push(target);
        visitOrder.push(target);
      }
    }

    yield {
      type: "visit",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(visited),
        active: new Set(active),
        visitOrder: [...visitOrder],
        nodesExamined,
        edgesExamined,
      }),
      description: `Visited ${nodes.find((n) => n.id === current)?.label ?? current}. Queue: ${queue.length} nodes`,
      codeLine: 4,
      variables: { current, visited: visited.size, queueSize: queue.length },
    };
  }

  yield {
    type: "complete",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(visited),
      active: new Set(),
      visitOrder: [...visitOrder],
      nodesExamined,
      edgesExamined,
    }),
    description: `BFS complete. Visited ${visited.size}/${nodes.length} nodes.`,
    codeLine: 8,
    variables: { totalVisited: visited.size, totalNodes: nodes.length },
  };
}
