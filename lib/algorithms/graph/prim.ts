import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GraphConfig, GraphStep } from "./types";
import { buildAdjacencyList, makeStep } from "./types";
import { PriorityQueue } from "./utils";

export const primMeta: AlgorithmMeta = {
  id: "graph-prim",
  name: "Prim MST",
  category: "graph",
  description:
    "Prim's algorithm grows a Minimum Spanning Tree from a source node by always adding the cheapest edge connecting the MST to a non-MST vertex.",
  timeComplexity: {
    best: "O((V+E) log V)",
    average: "O((V+E) log V)",
    worst: "O((V+E) log V)",
  },
  spaceComplexity: "O(V + E)",
  pseudocode: `function Prim(graph, source):
  inMST = {source}
  pq = edges from source
  mst = []
  while pq not empty and |mst| < |V|-1:
    (w, u, v, eid) = pq.extractMin()
    if v in inMST: continue
    inMST.add(v)
    mst.add(edge)
    for neighbor of v not in inMST:
      pq.insert((weight, v, neighbor))`,
  relatedAlgorithms: ["graph-kruskal", "graph-dijkstra"],
};

registerAlgorithm(primMeta);

export function* prim(config: GraphConfig): AlgorithmGenerator<GraphStep> {
  const { nodes, edges, directed, sourceNode } = config;
  const source = sourceNode ?? nodes[0]?.id;
  if (!source) return;

  const adj = buildAdjacencyList(nodes, edges, directed);
  const inMST = new Set<string>();
  const mstEdges = new Set<string>();
  let totalWeight = 0;
  let nodesExamined = 0;
  let edgesExamined = 0;

  inMST.add(source);
  nodesExamined++;

  const pq = new PriorityQueue<{
    from: string;
    to: string;
    weight: number;
    edgeId: string;
  }>();
  for (const { target, weight, edgeId } of adj.get(source) ?? []) {
    pq.push({ from: source, to: target, weight, edgeId }, weight);
  }

  yield {
    type: "init",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(inMST),
      active: new Set([source]),
      mstEdges: new Set(mstEdges),
      nodesExamined,
      edgesExamined,
    }),
    description: `Prim: Starting MST from ${nodes.find((n) => n.id === source)?.label ?? source}`,
    codeLine: 2,
    variables: { source, pqSize: pq.size },
  };

  while (!pq.isEmpty() && mstEdges.size < nodes.length - 1) {
    const item = pq.pop()!;
    edgesExamined++;

    if (inMST.has(item.to)) continue;

    const fromLabel = nodes.find((n) => n.id === item.from)?.label ?? item.from;
    const toLabel = nodes.find((n) => n.id === item.to)?.label ?? item.to;

    yield {
      type: "examine-edge",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(inMST),
        active: new Set([item.to]),
        currentEdge: item.edgeId,
        mstEdges: new Set(mstEdges),
        nodesExamined,
        edgesExamined,
      }),
      description: `Cheapest cut edge: ${fromLabel}-${toLabel} (w=${item.weight})`,
      codeLine: 5,
      variables: { from: fromLabel, to: toLabel, weight: item.weight },
    };

    inMST.add(item.to);
    mstEdges.add(item.edgeId);
    totalWeight += item.weight;
    nodesExamined++;

    for (const { target, weight, edgeId } of adj.get(item.to) ?? []) {
      if (!inMST.has(target)) {
        pq.push({ from: item.to, to: target, weight, edgeId }, weight);
      }
    }

    yield {
      type: "add-to-mst",
      data: makeStep({
        nodes,
        edges,
        visited: new Set(inMST),
        mstEdges: new Set(mstEdges),
        nodesExamined,
        edgesExamined,
      }),
      description: `Added ${toLabel} to MST. Total weight: ${totalWeight}`,
      codeLine: 8,
      variables: { mstSize: mstEdges.size, totalWeight, inMST: inMST.size },
    };
  }

  yield {
    type: "complete",
    data: makeStep({
      nodes,
      edges,
      visited: new Set(inMST),
      mstEdges: new Set(mstEdges),
      nodesExamined,
      edgesExamined,
    }),
    description: `Prim complete. MST weight: ${totalWeight}, edges: ${mstEdges.size}`,
    codeLine: 10,
    variables: { totalWeight, mstEdges: mstEdges.size },
  };
}
