export { bellmanFord, bellmanFordMeta } from "./bellman-ford";
export { bfsGraph, bfsGraphMeta } from "./bfs-graph";
export { dfsGraph, dfsGraphMeta } from "./dfs-graph";
export { dijkstraGraph, dijkstraGraphMeta } from "./dijkstra-graph";
export { floydWarshall, floydWarshallMeta } from "./floyd-warshall";
export { kruskal, kruskalMeta } from "./kruskal";
export { GRAPH_PRESETS } from "./presets";
export { prim, primMeta } from "./prim";
export { tarjanScc, tarjanSccMeta } from "./tarjan-scc";
export { SCC_COLORS } from "./tarjan-scc";
export { topologicalSort, topologicalSortMeta } from "./topological-sort";
export type { GraphConfig, GraphEdge, GraphNode, GraphStep } from "./types";
export { buildAdjacencyList, makeStep } from "./types";

import type { AlgorithmStep } from "@/types";

import { bellmanFord } from "./bellman-ford";
import { bfsGraph } from "./bfs-graph";
import { dfsGraph } from "./dfs-graph";
import { dijkstraGraph } from "./dijkstra-graph";
import { floydWarshall } from "./floyd-warshall";
import { kruskal } from "./kruskal";
import { prim } from "./prim";
import { tarjanScc } from "./tarjan-scc";
import { topologicalSort } from "./topological-sort";
import type { GraphConfig, GraphStep } from "./types";

export const GRAPH_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<GraphStep>, void, undefined>
> = {
  "graph-bfs": (input) => bfsGraph(input as GraphConfig),
  "graph-dfs": (input) => dfsGraph(input as GraphConfig),
  "graph-dijkstra": (input) => dijkstraGraph(input as GraphConfig),
  "graph-bellman-ford": (input) => bellmanFord(input as GraphConfig),
  "graph-floyd-warshall": (input) => floydWarshall(input as GraphConfig),
  "graph-kruskal": (input) => kruskal(input as GraphConfig),
  "graph-prim": (input) => prim(input as GraphConfig),
  "graph-topological-sort": (input) => topologicalSort(input as GraphConfig),
  "graph-tarjan-scc": (input) => tarjanScc(input as GraphConfig),
};
