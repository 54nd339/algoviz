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

export const dijkstraMeta: AlgorithmMeta = {
  id: "pathfinding-dijkstra",
  name: "Dijkstra's Algorithm",
  category: "pathfinding",
  description:
    "Finds the shortest path on weighted grids using a priority queue. Always expands the unvisited cell with the smallest known distance. Handles weighted terrain correctly.",
  timeComplexity: {
    best: "O(V log V)",
    average: "O((V + E) log V)",
    worst: "O((V + E) log V)",
  },
  spaceComplexity: "O(V)",
  pseudocode: `function Dijkstra(grid, start, end):
  dist = {start: 0}
  pq = [(0, start)]
  parent = {}
  while pq not empty:
    (d, current) = pq.extractMin()
    if current == end:
      return reconstructPath(parent, start, end)
    for neighbor in getNeighbors(current):
      cost = d + weight(neighbor)
      if cost < dist[neighbor]:
        dist[neighbor] = cost
        parent[neighbor] = current
        pq.insert((cost, neighbor))
  return no path`,
  presets: [
    {
      name: "Weighted Grid (20x20)",
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
  relatedAlgorithms: ["pathfinding-bfs", "pathfinding-a-star"],
};

registerAlgorithm(dijkstraMeta);

// Simple binary heap priority queue
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

export function* dijkstra(input: GridConfig): AlgorithmGenerator<PathStep> {
  const { rows, cols, start, end, allowDiagonal, weights } = input;
  const grid = getWorkingGrid(input);

  const startKey = cellKey(start[0], start[1]);
  const endKey = cellKey(end[0], end[1]);

  const dist: Record<string, number> = { [startKey]: 0 };
  const parent: Record<string, string> = {};
  const visited = new Set<string>();
  const pq = new MinPQ();
  pq.insert(startKey, 0);

  yield {
    type: "init",
    data: {
      grid,
      visited: [],
      frontier: [startKey],
      current: start,
      path: [],
      distances: { ...dist },
      parent: { ...parent },
      visitedCount: 0,
      frontierSize: 1,
      pathLength: 0,
      totalCost: 0,
      phase: "searching",
    },
    description: `Dijkstra: Starting from (${start[0]},${start[1]})`,
    codeLine: 2,
    variables: { start, end },
  };

  while (pq.size > 0) {
    const { key: currentKey, priority: currentDist } = pq.extractMin()!;
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    const [cr, cc] = currentKey.split(",").map(Number);

    if (currentKey === endKey) {
      const path = reconstructPath(parent, startKey, endKey);
      yield {
        type: "path-found",
        data: {
          grid,
          visited: [...visited],
          frontier: pq.keys(),
          current: [cr, cc],
          path,
          distances: { ...dist },
          parent: { ...parent },
          visitedCount: visited.size,
          frontierSize: pq.size,
          pathLength: path.length,
          totalCost: currentDist,
          phase: "path-found",
        },
        description: `Shortest path found! Length: ${path.length}, cost: ${currentDist}`,
        codeLine: 7,
        variables: {
          pathLength: path.length,
          totalCost: currentDist,
          visitedCount: visited.size,
        },
      };
      return;
    }

    const neighbors = getNeighbors(cr, cc, rows, cols, allowDiagonal);

    for (const [nr, nc] of neighbors) {
      const nKey = cellKey(nr, nc);
      if (visited.has(nKey) || grid[nr][nc] === CellState.Wall) continue;

      const cost = currentDist + getCellCost(nr, nc, weights);
      if (dist[nKey] === undefined || cost < dist[nKey]) {
        dist[nKey] = cost;
        parent[nKey] = currentKey;
        pq.insert(nKey, cost);
      }
    }

    yield {
      type: "explore",
      data: {
        grid,
        visited: [...visited],
        frontier: pq.keys(),
        current: [cr, cc],
        path: [],
        distances: { ...dist },
        parent: { ...parent },
        visitedCount: visited.size,
        frontierSize: pq.size,
        pathLength: 0,
        totalCost: 0,
        phase: "searching",
      },
      description: `Exploring (${cr},${cc}) dist=${currentDist}, visited: ${visited.size}`,
      codeLine: 5,
      variables: {
        current: [cr, cc],
        dist: currentDist,
        visited: visited.size,
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
      distances: { ...dist },
      parent: { ...parent },
      visitedCount: visited.size,
      frontierSize: 0,
      pathLength: 0,
      totalCost: 0,
      phase: "no-path",
    },
    description: "No path found!",
    codeLine: 14,
    variables: { visitedCount: visited.size },
  };
}
