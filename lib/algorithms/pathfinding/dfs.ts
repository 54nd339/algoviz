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

export const dfsMeta: AlgorithmMeta = {
  id: "pathfinding-dfs",
  name: "DFS (Depth-First)",
  category: "pathfinding",
  description:
    "Explores as deep as possible along each branch before backtracking. Finds a path (not necessarily shortest) using a LIFO stack. Shows characteristic deep exploration behavior.",
  timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
  spaceComplexity: "O(V)",
  pseudocode: `function DFS(grid, start, end):
  stack = [start]
  visited = {start}
  parent = {}
  while stack not empty:
    current = stack.pop()
    if current == end:
      return reconstructPath(parent, start, end)
    for neighbor in getNeighbors(current):
      if neighbor not in visited and not wall:
        visited.add(neighbor)
        parent[neighbor] = current
        stack.push(neighbor)
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
  ],
  misconceptions: [
    {
      myth: "DFS always finds the shortest path.",
      reality:
        "DFS finds a path, but it is typically not the shortest. Use BFS or Dijkstra for shortest paths.",
    },
  ],
  relatedAlgorithms: ["pathfinding-bfs", "pathfinding-dijkstra"],
};

registerAlgorithm(dfsMeta);

export function* dfs(input: GridConfig): AlgorithmGenerator<PathStep> {
  const { rows, cols, start, end, allowDiagonal } = input;
  const grid = getWorkingGrid(input);

  const startKey = cellKey(start[0], start[1]);
  const endKey = cellKey(end[0], end[1]);

  const visited = new Set<string>([startKey]);
  const parent: Record<string, string> = {};
  const distances: Record<string, number> = { [startKey]: 0 };
  const stack: string[] = [startKey];

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
    description: `DFS: Starting from (${start[0]},${start[1]})`,
    codeLine: 2,
    variables: { start, end },
  };

  while (stack.length > 0) {
    const currentKey = stack.pop()!;
    const [cr, cc] = currentKey.split(",").map(Number);

    if (currentKey === endKey) {
      const path = reconstructPath(parent, startKey, endKey);
      yield {
        type: "path-found",
        data: {
          grid,
          visited: [...visited],
          frontier: [...stack],
          current: [cr, cc],
          path,
          distances,
          parent,
          visitedCount: visited.size,
          frontierSize: stack.length,
          pathLength: path.length,
          totalCost: path.length - 1,
          phase: "path-found",
        },
        description: `Path found! Length: ${path.length} (may not be shortest)`,
        codeLine: 6,
        variables: { pathLength: path.length, visitedCount: visited.size },
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
        stack.push(nKey);
      }
    }

    yield {
      type: "explore",
      data: {
        grid,
        visited: [...visited],
        frontier: [...stack],
        current: [cr, cc],
        path: [],
        distances: { ...distances },
        parent: { ...parent },
        visitedCount: visited.size,
        frontierSize: stack.length,
        pathLength: 0,
        totalCost: 0,
        phase: "searching",
      },
      description: `Exploring (${cr},${cc}), visited: ${visited.size}, stack: ${stack.length}`,
      codeLine: 5,
      variables: {
        current: [cr, cc],
        visited: visited.size,
        stack: stack.length,
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
