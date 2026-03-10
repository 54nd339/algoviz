import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GraphConfig, GraphStep } from "./types";
import { makeStep } from "./types";
import { UnionFind } from "./utils";

export const kruskalMeta: AlgorithmMeta = {
  id: "graph-kruskal",
  name: "Kruskal MST",
  category: "graph",
  description:
    "Kruskal's algorithm finds a Minimum Spanning Tree by greedily adding the lightest edge that doesn't create a cycle, using Union-Find for cycle detection.",
  timeComplexity: {
    best: "O(E log E)",
    average: "O(E log E)",
    worst: "O(E log E)",
  },
  spaceComplexity: "O(V + E)",
  pseudocode: `function Kruskal(graph):
  sort edges by weight
  uf = UnionFind(|V|)
  mst = []
  for each edge (u, v, w) in sorted:
    if uf.find(u) != uf.find(v):
      uf.union(u, v)
      mst.add(edge)
  return mst`,
  relatedAlgorithms: ["graph-prim"],
};

registerAlgorithm(kruskalMeta);

export function* kruskal(config: GraphConfig): AlgorithmGenerator<GraphStep> {
  const { nodes, edges } = config;

  const nodeIndex = new Map<string, number>();
  nodes.forEach((n, i) => nodeIndex.set(n.id, i));

  const sortedEdges = [...edges].sort(
    (a, b) => (a.weight ?? 1) - (b.weight ?? 1),
  );
  const uf = new UnionFind(nodes.length);
  const mstEdges = new Set<string>();
  let totalWeight = 0;
  let edgesExamined = 0;

  yield {
    type: "init",
    data: makeStep({
      nodes,
      edges,
      mstEdges: new Set(mstEdges),
      nodesExamined: 0,
      edgesExamined,
    }),
    description: `Kruskal: Sorted ${edges.length} edges by weight`,
    codeLine: 2,
    variables: { totalEdges: edges.length, targetEdges: nodes.length - 1 },
  };

  for (const e of sortedEdges) {
    edgesExamined++;
    const uIdx = nodeIndex.get(e.source)!;
    const vIdx = nodeIndex.get(e.target)!;
    const w = e.weight ?? 1;
    const uLabel = nodes.find((n) => n.id === e.source)?.label ?? e.source;
    const vLabel = nodes.find((n) => n.id === e.target)?.label ?? e.target;

    const wouldCycle = uf.connected(uIdx, vIdx);

    yield {
      type: "examine-edge",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(
          mstEdges.size > 0
            ? nodes
                .filter((_, i) => {
                  const root = uf.find(i);
                  return nodes.some((_, j) => j !== i && uf.find(j) === root);
                })
                .map((n) => n.id)
            : [],
        ),
        active: new Set([e.source, e.target]),
        currentEdge: e.id,
        mstEdges: new Set(mstEdges),
        nodesExamined: mstEdges.size,
        edgesExamined,
      }),
      description: `Edge ${uLabel}-${vLabel} (w=${w}): ${wouldCycle ? "REJECTED (cycle)" : "checking..."}`,
      codeLine: 6,
      variables: { edge: `${uLabel}-${vLabel}`, weight: w, wouldCycle },
    };

    if (!wouldCycle) {
      uf.union(uIdx, vIdx);
      mstEdges.add(e.id);
      totalWeight += w;

      yield {
        type: "accept",
        data: makeStep({
          nodes,
          edges,
          visited: new Set(
            nodes
              .filter((_, i) => {
                const root = uf.find(i);
                return nodes.some((_, j) => j !== i && uf.find(j) === root);
              })
              .map((n) => n.id),
          ),
          mstEdges: new Set(mstEdges),
          nodesExamined: mstEdges.size,
          edgesExamined,
        }),
        description: `Accepted ${uLabel}-${vLabel}. MST edges: ${mstEdges.size}, total weight: ${totalWeight}`,
        codeLine: 8,
        variables: {
          mstSize: mstEdges.size,
          totalWeight,
          components: uf.count,
        },
      };

      if (mstEdges.size === nodes.length - 1) break;
    }
  }

  yield {
    type: "complete",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(nodes.map((n) => n.id)),
      mstEdges: new Set(mstEdges),
      nodesExamined: nodes.length,
      edgesExamined,
    }),
    description: `Kruskal complete. MST weight: ${totalWeight}, edges: ${mstEdges.size}`,
    codeLine: 9,
    variables: { totalWeight, mstEdges: mstEdges.size },
  };
}
