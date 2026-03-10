import type { AlgorithmGenerator, AlgorithmMeta, StackFrame } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GraphConfig, GraphStep } from "./types";
import { buildAdjacencyList, makeStep } from "./types";

export const dfsGraphMeta: AlgorithmMeta = {
  id: "graph-dfs",
  name: "DFS (Graph)",
  category: "graph",
  description:
    "Depth-First Search explores as far as possible along each branch before backtracking. Useful for cycle detection, topological sorting, and finding connected components.",
  timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
  spaceComplexity: "O(V)",
  pseudocode: `function DFS(graph, source):
  visited = {}
  function explore(node):
    visited.add(node)
    for neighbor in adj[node]:
      if neighbor not in visited:
        explore(neighbor)
  explore(source)`,
  relatedAlgorithms: [
    "graph-bfs",
    "graph-topological-sort",
    "graph-tarjan-scc",
  ],
};

registerAlgorithm(dfsGraphMeta);

export function* dfsGraph(config: GraphConfig): AlgorithmGenerator<GraphStep> {
  const { nodes, edges, directed, sourceNode } = config;
  const source = sourceNode ?? nodes[0]?.id;
  if (!source) return;

  const adj = buildAdjacencyList(nodes, edges, directed);
  const visited = new Set<string>();
  const active = new Set<string>();
  const visitOrder: string[] = [];
  let nodesExamined = 0;
  let edgesExamined = 0;
  const callStack: StackFrame[] = [];

  yield {
    type: "init",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(),
      active: new Set(),
      visitOrder: [],
      nodesExamined,
      edgesExamined,
    }),
    description: `DFS: Starting from node ${nodes.find((n) => n.id === source)?.label ?? source}`,
    codeLine: 1,
    variables: { source },
    callStack: [],
  };

  function* explore(
    nodeId: string,
  ): Generator<ReturnType<typeof makeStepObj>, void, undefined> {
    visited.add(nodeId);
    active.add(nodeId);
    visitOrder.push(nodeId);
    nodesExamined++;

    const label = nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
    callStack.push({ name: `explore(${label})`, args: { node: label } });

    yield makeStepObj("discover", `Discovered node ${label}`, 4);

    const neighbors = adj.get(nodeId) ?? [];
    for (const { target, edgeId } of neighbors) {
      edgesExamined++;

      yield makeStepObj(
        "examine-edge",
        `Examining edge to ${nodes.find((n) => n.id === target)?.label ?? target}`,
        5,
        edgeId,
      );

      if (!visited.has(target)) {
        yield* explore(target);
      }
    }

    active.delete(nodeId);
    callStack.pop();
    yield makeStepObj("finish", `Finished node ${label}`, 7);
  }

  function makeStepObj(
    type: string,
    description: string,
    codeLine: number,
    currentEdge?: string,
  ) {
    return {
      type,
      data: makeStep({
        nodes,
        edges,
        visited: new Set(visited),
        active: new Set(active),
        visitOrder: [...visitOrder],
        currentEdge,
        nodesExamined,
        edgesExamined,
      }),
      description,
      codeLine,
      variables: { visited: visited.size, stackDepth: callStack.length },
      callStack: [...callStack],
    };
  }

  yield* explore(source);

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
    description: `DFS complete. Visited ${visited.size}/${nodes.length} nodes.`,
    codeLine: 8,
    variables: { totalVisited: visited.size, totalNodes: nodes.length },
    callStack: [],
  };
}
