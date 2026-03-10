import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GridConfig, PathStep } from "./types";
import {
  cellKey,
  CellState,
  getCellCost,
  getNeighbors,
  getWorkingGrid,
  reconstructPath,
} from "./types";

export const aStarMeta: AlgorithmMeta = {
  id: "pathfinding-a-star",
  name: "A* Search",
  category: "pathfinding",
  description:
    "Combines Dijkstra's cost-so-far (g) with a heuristic estimate of remaining distance (h). Expands cells with lowest f = g + h. Optimal with admissible heuristics. Supports Manhattan and Euclidean heuristics.",
  timeComplexity: {
    best: "O(V log V)",
    average: "O((V + E) log V)",
    worst: "O((V + E) log V)",
  },
  spaceComplexity: "O(V)",
  pseudocode: `function AStar(grid, start, end, heuristic):
  g = {start: 0}
  f = {start: h(start, end)}
  pq = [(f[start], start)]
  parent = {}
  while pq not empty:
    (_, current) = pq.extractMin()
    if current == end:
      return reconstructPath(parent, start, end)
    for neighbor in getNeighbors(current):
      tentative_g = g[current] + weight(neighbor)
      if tentative_g < g[neighbor]:
        g[neighbor] = tentative_g
        f[neighbor] = g[neighbor] + h(neighbor, end)
        parent[neighbor] = current
        pq.insert((f[neighbor], neighbor))
  return no path`,
  presets: [
    {
      name: "Manhattan Heuristic",
      generator: () => ({
        rows: 20,
        cols: 20,
        start: [0, 0],
        end: [19, 19],
        allowDiagonal: false,
        weights: {},
        heuristic: "manhattan",
      }),
      expectedCase: "average",
    },
    {
      name: "Euclidean Heuristic",
      generator: () => ({
        rows: 20,
        cols: 20,
        start: [0, 0],
        end: [19, 19],
        allowDiagonal: true,
        weights: {},
        heuristic: "euclidean",
      }),
      expectedCase: "average",
    },
  ],
  relatedAlgorithms: ["pathfinding-dijkstra", "pathfinding-greedy-best-first"],
};

registerAlgorithm(aStarMeta);

function manhattan(a: [number, number], b: [number, number]): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function euclidean(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

class MinPQ {
  private heap: { key: string; priority: number }[] = [];
  get size() {
    return this.heap.length;
  }

  insert(key: string, priority: number) {
    this.heap.push({ key, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): { key: string; priority: number } | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return min;
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].priority <= this.heap[i].priority) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private sinkDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].priority < this.heap[smallest].priority)
        smallest = left;
      if (right < n && this.heap[right].priority < this.heap[smallest].priority)
        smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }

  keys(): string[] {
    return this.heap.map((h) => h.key);
  }
}

export function* aStar(input: GridConfig): AlgorithmGenerator<PathStep> {
  const {
    rows,
    cols,
    start,
    end,
    allowDiagonal,
    weights,
    heuristic: heuristicType,
  } = input;
  const h = heuristicType === "euclidean" ? euclidean : manhattan;
  const grid = getWorkingGrid(input);

  const startKey = cellKey(start[0], start[1]);
  const endKey = cellKey(end[0], end[1]);

  const g: Record<string, number> = { [startKey]: 0 };
  const f: Record<string, number> = { [startKey]: h(start, end) };
  const parent: Record<string, string> = {};
  const visited = new Set<string>();
  const pq = new MinPQ();
  pq.insert(startKey, f[startKey]);

  yield {
    type: "init",
    data: {
      grid,
      visited: [],
      frontier: [startKey],
      current: start,
      path: [],
      distances: { ...g },
      parent: { ...parent },
      visitedCount: 0,
      frontierSize: 1,
      pathLength: 0,
      totalCost: 0,
      phase: "searching",
    },
    description: `A*: Starting with ${heuristicType ?? "manhattan"} heuristic`,
    codeLine: 3,
    variables: { start, end, heuristic: heuristicType ?? "manhattan" },
  };

  while (pq.size > 0) {
    const { key: currentKey } = pq.extractMin()!;
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    const [cr, cc] = currentKey.split(",").map(Number);
    const current: [number, number] = [cr, cc];

    if (currentKey === endKey) {
      const path = reconstructPath(parent, startKey, endKey);
      yield {
        type: "path-found",
        data: {
          grid,
          visited: [...visited],
          frontier: pq.keys(),
          current,
          path,
          distances: { ...g },
          parent: { ...parent },
          visitedCount: visited.size,
          frontierSize: pq.size,
          pathLength: path.length,
          totalCost: g[endKey],
          phase: "path-found",
        },
        description: `Optimal path found! Length: ${path.length}, cost: ${g[endKey]}`,
        codeLine: 8,
        variables: {
          pathLength: path.length,
          totalCost: g[endKey],
          visitedCount: visited.size,
        },
      };
      return;
    }

    const neighbors = getNeighbors(cr, cc, rows, cols, allowDiagonal);

    for (const [nr, nc] of neighbors) {
      const nKey = cellKey(nr, nc);
      if (visited.has(nKey) || grid[nr][nc] === CellState.Wall) continue;

      const tentativeG = g[currentKey] + getCellCost(nr, nc, weights);
      if (g[nKey] === undefined || tentativeG < g[nKey]) {
        g[nKey] = tentativeG;
        f[nKey] = tentativeG + h([nr, nc], end);
        parent[nKey] = currentKey;
        pq.insert(nKey, f[nKey]);
      }
    }

    yield {
      type: "explore",
      data: {
        grid,
        visited: [...visited],
        frontier: pq.keys(),
        current,
        path: [],
        distances: { ...g },
        parent: { ...parent },
        visitedCount: visited.size,
        frontierSize: pq.size,
        pathLength: 0,
        totalCost: 0,
        phase: "searching",
      },
      description: `Exploring (${cr},${cc}) g=${g[currentKey]} f=${f[currentKey]?.toFixed(1)}`,
      codeLine: 6,
      variables: {
        current,
        g: g[currentKey],
        h: h(current, end).toFixed(1),
        f: f[currentKey]?.toFixed(1),
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
      distances: { ...g },
      parent: { ...parent },
      visitedCount: visited.size,
      frontierSize: 0,
      pathLength: 0,
      totalCost: 0,
      phase: "no-path",
    },
    description: "No path found!",
    codeLine: 16,
    variables: { visitedCount: visited.size },
  };
}
