import type { AlgorithmGenerator, AlgorithmMeta, StackFrame } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GraphConfig, GraphStep } from "./types";
import { buildAdjacencyList, makeStep } from "./types";

export const topologicalSortMeta: AlgorithmMeta = {
  id: "graph-topological-sort",
  name: "Topological Sort",
  category: "graph",
  description:
    "Topological Sort produces a linear ordering of vertices in a DAG such that for every directed edge u→v, u comes before v. Uses DFS with finish-time ordering.",
  timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
  spaceComplexity: "O(V)",
  pseudocode: `function TopologicalSort(graph):
  visited = {}
  order = []
  function dfs(node):
    visited.add(node)
    for neighbor in adj[node]:
      if neighbor not in visited:
        dfs(neighbor)
    order.prepend(node)
  for each node in graph:
    if node not in visited:
      dfs(node)
  return order`,
  relatedAlgorithms: ["graph-dfs", "graph-tarjan-scc"],
};

registerAlgorithm(topologicalSortMeta);

export function* topologicalSort(
  config: GraphConfig,
): AlgorithmGenerator<GraphStep> {
  const { nodes, edges } = config;
  const adj = buildAdjacencyList(nodes, edges, true);

  const visited = new Set<string>();
  const active = new Set<string>();
  const topoOrder: string[] = [];
  let nodesExamined = 0;
  let edgesExamined = 0;
  const callStack: StackFrame[] = [];

  yield {
    type: "init",
    data: makeStep({
      nodes,
      edges,
      topoOrder: [],
      nodesExamined,
      edgesExamined,
    }),
    description: "Topological Sort: DFS-based ordering on DAG",
    codeLine: 1,
    variables: { totalNodes: nodes.length },
    callStack: [],
  };

  function* dfs(nodeId: string): Generator<
    {
      type: string;
      data: GraphStep;
      description: string;
      codeLine: number;
      variables: Record<string, unknown>;
      callStack: StackFrame[];
    },
    void,
    undefined
  > {
    visited.add(nodeId);
    active.add(nodeId);
    nodesExamined++;
    const label = nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
    callStack.push({ name: `dfs(${label})`, args: { node: label } });

    yield {
      type: "discover",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(visited),
        active: new Set(active),
        topoOrder: [...topoOrder],
        nodesExamined,
        edgesExamined,
      }),
      description: `Exploring ${label}`,
      codeLine: 4,
      variables: {
        current: label,
        orderSoFar: topoOrder.map(
          (id) => nodes.find((n) => n.id === id)?.label,
        ),
      },
      callStack: [...callStack],
    };

    for (const { target, edgeId } of adj.get(nodeId) ?? []) {
      edgesExamined++;

      yield {
        type: "examine-edge",
        data: makeStep({
          nodes,
          edges,
          visited: new Set(visited),
          active: new Set(active),
          currentEdge: edgeId,
          topoOrder: [...topoOrder],
          nodesExamined,
          edgesExamined,
        }),
        description: `Edge ${label} → ${nodes.find((n) => n.id === target)?.label ?? target}`,
        codeLine: 6,
        variables: {
          from: label,
          to: nodes.find((n) => n.id === target)?.label,
        },
        callStack: [...callStack],
      };

      if (!visited.has(target)) {
        yield* dfs(target);
      }
    }

    active.delete(nodeId);
    topoOrder.unshift(nodeId);
    callStack.pop();

    yield {
      type: "finish",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(visited),
        active: new Set(active),
        topoOrder: [...topoOrder],
        nodesExamined,
        edgesExamined,
      }),
      description: `Finished ${label}. Order: [${topoOrder.map((id) => nodes.find((n) => n.id === id)?.label).join(", ")}]`,
      codeLine: 9,
      variables: {
        finished: label,
        orderSoFar: topoOrder.map(
          (id) => nodes.find((n) => n.id === id)?.label,
        ),
      },
      callStack: [...callStack],
    };
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      yield* dfs(node.id);
    }
  }

  yield {
    type: "complete",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(visited),
      topoOrder: [...topoOrder],
      nodesExamined,
      edgesExamined,
    }),
    description: `Topological order: [${topoOrder.map((id) => nodes.find((n) => n.id === id)?.label).join(", ")}]`,
    codeLine: 13,
    variables: {
      order: topoOrder.map((id) => nodes.find((n) => n.id === id)?.label),
    },
    callStack: [],
  };
}
