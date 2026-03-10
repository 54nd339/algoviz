import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GridConfig, PathStep } from "./types";
import {
  cellKey,
  CellState,
  getNeighbors,
  getWorkingGrid,
  reconstructPath,
} from "./types";

export const bfsMeta: AlgorithmMeta = {
  id: "pathfinding-bfs",
  name: "BFS (Breadth-First)",
  category: "pathfinding",
  description:
    "Explores all cells at distance d before cells at distance d+1, guaranteeing the shortest path on unweighted grids. Uses a FIFO queue.",
  timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
  spaceComplexity: "O(V)",
  pseudocode: `function BFS(grid, start, end):
  queue = [start]
  visited = {start}
  parent = {}
  while queue not empty:
    current = queue.dequeue()
    if current == end:
      return reconstructPath(parent, start, end)
    for neighbor in getNeighbors(current):
      if neighbor not in visited and not wall:
        visited.add(neighbor)
        parent[neighbor] = current
        queue.enqueue(neighbor)
  return no path`,
  presets: [
    {
      name: "Open Grid (20x20)",
      generator: () => ({
        rows: 20,
        cols: 20,
        start: [0, 0],
        end: [19, 19],
        allowDiagonal: false,
        weights: {},
      }),
      expectedCase: "average",
    },
    {
      name: "With Diagonal",
      generator: () => ({
        rows: 20,
        cols: 20,
        start: [0, 0],
        end: [19, 19],
        allowDiagonal: true,
        weights: {},
      }),
      expectedCase: "average",
    },
  ],
  relatedAlgorithms: [
    "pathfinding-dfs",
    "pathfinding-dijkstra",
    "pathfinding-a-star",
  ],
};

registerAlgorithm(bfsMeta);

export function* bfs(input: GridConfig): AlgorithmGenerator<PathStep> {
  const { rows, cols, start, end, allowDiagonal } = input;
  const grid = getWorkingGrid(input);

  const startKey = cellKey(start[0], start[1]);
  const endKey = cellKey(end[0], end[1]);

  const visited = new Set<string>([startKey]);
  const parent: Record<string, string> = {};
  const distances: Record<string, number> = { [startKey]: 0 };
  const queue: string[] = [startKey];

  yield {
    type: "init",
    data: {
      grid,
      visited: [startKey],
      frontier: [startKey],
      current: start,
      path: [],
      distances,
      parent,
      visitedCount: 1,
      frontierSize: 1,
      pathLength: 0,
      totalCost: 0,
      phase: "searching",
    },
    description: `BFS: Starting from (${start[0]},${start[1]})`,
    codeLine: 2,
    variables: { start, end, rows, cols },
  };

  while (queue.length > 0) {
    const currentKey = queue.shift()!;
    const [cr, cc] = currentKey.split(",").map(Number);

    if (currentKey === endKey) {
      const path = reconstructPath(parent, startKey, endKey);
      const totalCost = path.length - 1;

      yield {
        type: "path-found",
        data: {
          grid,
          visited: [...visited],
          frontier: [...queue],
          current: [cr, cc],
          path,
          distances,
          parent,
          visitedCount: visited.size,
          frontierSize: queue.length,
          pathLength: path.length,
          totalCost,
          phase: "path-found",
        },
        description: `Path found! Length: ${path.length}, cost: ${totalCost}`,
        codeLine: 6,
        variables: {
          pathLength: path.length,
          totalCost,
          visitedCount: visited.size,
        },
      };
      return;
    }

    const neighbors = getNeighbors(cr, cc, rows, cols, allowDiagonal);

    for (const [nr, nc] of neighbors) {
      const nKey = cellKey(nr, nc);
      if (!visited.has(nKey) && grid[nr][nc] !== CellState.Wall) {
        visited.add(nKey);
        parent[nKey] = currentKey;
        distances[nKey] = (distances[currentKey] ?? 0) + 1;
        queue.push(nKey);
      }
    }

    yield {
      type: "explore",
      data: {
        grid,
        visited: [...visited],
        frontier: [...queue],
        current: [cr, cc],
        path: [],
        distances: { ...distances },
        parent: { ...parent },
        visitedCount: visited.size,
        frontierSize: queue.length,
        pathLength: 0,
        totalCost: 0,
        phase: "searching",
      },
      description: `Exploring (${cr},${cc}), visited: ${visited.size}, frontier: ${queue.length}`,
      codeLine: 5,
      variables: {
        current: [cr, cc],
        visited: visited.size,
        frontier: queue.length,
      },
    };
  }

  yield {
    type: "no-path",
    data: {
      grid,
      visited: [...visited],
      frontier: [],
      path: [],
      distances,
      parent,
      visitedCount: visited.size,
      frontierSize: 0,
      pathLength: 0,
      totalCost: 0,
      phase: "no-path",
    },
    description: "No path found!",
    codeLine: 12,
    variables: { visitedCount: visited.size },
  };
}
