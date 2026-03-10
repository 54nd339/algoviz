import type { AlgorithmGenerator, AlgorithmMeta, StackFrame } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GraphConfig, GraphStep } from "./types";
import { buildAdjacencyList, makeStep } from "./types";

const SCC_COLORS = [
  "#22c55e",
  "#06b6d4",
  "#f59e0b",
  "#a855f7",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export const tarjanSccMeta: AlgorithmMeta = {
  id: "graph-tarjan-scc",
  name: "Tarjan SCC",
  category: "graph",
  description:
    "Tarjan's algorithm finds all Strongly Connected Components in a directed graph using a single DFS pass with a stack and low-link values.",
  timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
  spaceComplexity: "O(V)",
  pseudocode: `function TarjanSCC(graph):
  index = 0
  stack = []
  for each node:
    if node.index undefined:
      strongconnect(node)

function strongconnect(v):
  v.index = v.lowlink = index++
  stack.push(v)
  for neighbor w of v:
    if w.index undefined:
      strongconnect(w)
      v.lowlink = min(v.lowlink, w.lowlink)
    else if w on stack:
      v.lowlink = min(v.lowlink, w.index)
  if v.lowlink == v.index:
    pop SCC from stack until v`,
  relatedAlgorithms: ["graph-dfs", "graph-topological-sort"],
};

registerAlgorithm(tarjanSccMeta);

export function* tarjanScc(config: GraphConfig): AlgorithmGenerator<GraphStep> {
  const { nodes, edges } = config;
  const adj = buildAdjacencyList(nodes, edges, true);

  const indexMap = new Map<string, number>();
  const lowLink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const sccGroups: string[][] = [];
  let index = 0;
  let nodesExamined = 0;
  let edgesExamined = 0;
  const callStack: StackFrame[] = [];

  yield {
    type: "init",
    data: makeStep({
      nodes,
      edges,
      sccGroups: [],
      nodesExamined,
      edgesExamined,
    }),
    description: "Tarjan SCC: Finding strongly connected components",
    codeLine: 1,
    variables: { totalNodes: nodes.length },
    callStack: [],
  };

  function* strongconnect(v: string): Generator<
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
    const vLabel = nodes.find((n) => n.id === v)?.label ?? v;
    indexMap.set(v, index);
    lowLink.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);
    nodesExamined++;

    callStack.push({
      name: `strongconnect(${vLabel})`,
      args: { node: vLabel, index: indexMap.get(v), lowlink: lowLink.get(v) },
    });

    yield {
      type: "discover",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(indexMap.keys()),
        active: new Set(onStack),
        sccGroups: [...sccGroups.map((g) => [...g])],
        nodesExamined,
        edgesExamined,
      }),
      description: `Discover ${vLabel}: index=${indexMap.get(v)}, lowlink=${lowLink.get(v)}`,
      codeLine: 8,
      variables: {
        node: vLabel,
        index: indexMap.get(v),
        lowlink: lowLink.get(v),
        stackSize: stack.length,
      },
      callStack: [...callStack],
    };

    for (const { target: w, edgeId } of adj.get(v) ?? []) {
      edgesExamined++;
      const wLabel = nodes.find((n) => n.id === w)?.label ?? w;

      if (!indexMap.has(w)) {
        yield {
          type: "tree-edge",
          data: makeStep({
            nodes,
            edges,
            visited: new Set(indexMap.keys()),
            active: new Set(onStack),
            currentEdge: edgeId,
            sccGroups: [...sccGroups.map((g) => [...g])],
            nodesExamined,
            edgesExamined,
          }),
          description: `Tree edge ${vLabel} → ${wLabel}`,
          codeLine: 11,
          variables: { from: vLabel, to: wLabel },
          callStack: [...callStack],
        };

        yield* strongconnect(w);
        lowLink.set(v, Math.min(lowLink.get(v)!, lowLink.get(w)!));
      } else if (onStack.has(w)) {
        lowLink.set(v, Math.min(lowLink.get(v)!, indexMap.get(w)!));

        yield {
          type: "back-edge",
          data: makeStep({
            nodes,
            edges,
            visited: new Set(indexMap.keys()),
            active: new Set(onStack),
            currentEdge: edgeId,
            sccGroups: [...sccGroups.map((g) => [...g])],
            nodesExamined,
            edgesExamined,
          }),
          description: `Back edge ${vLabel} → ${wLabel}. lowlink[${vLabel}]=${lowLink.get(v)}`,
          codeLine: 15,
          variables: { from: vLabel, to: wLabel, lowlink: lowLink.get(v) },
          callStack: [...callStack],
        };
      }
    }

    if (lowLink.get(v) === indexMap.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      sccGroups.push(scc);

      const sccLabels = scc.map(
        (id) => nodes.find((n) => n.id === id)?.label ?? id,
      );

      yield {
        type: "scc-found",
        data: makeStep({
          nodes,
          edges,
          visited: new Set(indexMap.keys()),
          active: new Set(onStack),
          sccGroups: [...sccGroups.map((g) => [...g])],
          nodesExamined,
          edgesExamined,
        }),
        description: `SCC #${sccGroups.length} found: {${sccLabels.join(", ")}}`,
        codeLine: 17,
        variables: {
          scc: sccLabels,
          totalSCCs: sccGroups.length,
          color: SCC_COLORS[(sccGroups.length - 1) % SCC_COLORS.length],
        },
        callStack: [...callStack],
      };
    }

    callStack.pop();
  }

  for (const node of nodes) {
    if (!indexMap.has(node.id)) {
      yield* strongconnect(node.id);
    }
  }

  yield {
    type: "complete",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(nodes.map((n) => n.id)),
      sccGroups: [...sccGroups.map((g) => [...g])],
      nodesExamined,
      edgesExamined,
    }),
    description: `Tarjan complete. Found ${sccGroups.length} SCCs.`,
    codeLine: 5,
    variables: {
      totalSCCs: sccGroups.length,
      groups: sccGroups.map((g) =>
        g.map((id) => nodes.find((n) => n.id === id)?.label),
      ),
    },
    callStack: [],
  };
}

export { SCC_COLORS };
