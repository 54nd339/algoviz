export { aStar, aStarMeta } from "./a-star";
export { bfs, bfsMeta } from "./bfs";
export { bidirectionalBfs, bidirectionalBfsMeta } from "./bidirectional-bfs";
export { dfs, dfsMeta } from "./dfs";
export { dijkstra, dijkstraMeta } from "./dijkstra";
export { greedyBestFirst, greedyBestFirstMeta } from "./greedy-best-first";
export type { GridConfig, PathStep } from "./types";
export {
  cellKey,
  CellState,
  createEmptyGrid,
  getCellCost,
  getNeighbors,
  parseKey,
  TerrainType,
} from "./types";

import type { AlgorithmStep } from "@/types";

import { aStar } from "./a-star";
import { bfs } from "./bfs";
import { bidirectionalBfs } from "./bidirectional-bfs";
import { dfs } from "./dfs";
import { dijkstra } from "./dijkstra";
import { greedyBestFirst } from "./greedy-best-first";
import type { PathStep } from "./types";

export const PATHFINDING_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<PathStep>, void, undefined>
> = {
  "pathfinding-bfs": (input) => bfs(input as import("./types").GridConfig),
  "pathfinding-dfs": (input) => dfs(input as import("./types").GridConfig),
  "pathfinding-dijkstra": (input) =>
    dijkstra(input as import("./types").GridConfig),
  "pathfinding-a-star": (input) => aStar(input as import("./types").GridConfig),
  "pathfinding-greedy-best-first": (input) =>
    greedyBestFirst(input as import("./types").GridConfig),
  "pathfinding-bidirectional-bfs": (input) =>
    bidirectionalBfs(input as import("./types").GridConfig),
};
