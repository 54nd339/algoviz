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

export const greedyBestFirstMeta: AlgorithmMeta = {
  id: "pathfinding-greedy-best-first",
  name: "Greedy Best-First",
  category: "pathfinding",
  description:
    "Expands the cell that appears closest to the goal based on heuristic alone (no cost-so-far). Very fast but does not guarantee the shortest path. Can be misled by obstacles.",
  timeComplexity: {
    best: "O(V log V)",
    average: "O((V + E) log V)",
    worst: "O((V + E) log V)",
  },
  spaceComplexity: "O(V)",
  pseudocode: `function greedyBestFirst(grid, start, end):
  pq = [(h(start, end), start)]
  visited = {}
  parent = {}
  while pq not empty:
    (_, current) = pq.extractMin()
    if current == end:
      return reconstructPath(parent, start, end)
    visited.add(current)
    for neighbor in getNeighbors(current):
      if neighbor not visited and not wall:
        parent[neighbor] = current
        pq.insert((h(neighbor, end), neighbor))
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
      myth: "Greedy best-first always finds the shortest path.",
      reality:
        "It only considers the heuristic, ignoring actual distance traveled. This can lead to suboptimal or even longer paths around obstacles.",
    },
  ],
  relatedAlgorithms: ["pathfinding-a-star", "pathfinding-dijkstra"],
};

registerAlgorithm(greedyBestFirstMeta);

function manhattan(a: [number, number], b: [number, number]): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
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
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p].priority <= this.heap[i].priority) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  private sinkDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.heap[l].priority < this.heap[smallest].priority)
        smallest = l;
      if (r < n && this.heap[r].priority < this.heap[smallest].priority)
        smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }

  keys(): string[] {
    return this.heap.map((h) => h.key);
  }
}

export function* greedyBestFirst(
  input: GridConfig,
): AlgorithmGenerator<PathStep> {
  const { rows, cols, start, end, allowDiagonal } = input;

  const grid = getWorkingGrid(input);

  const startKey = cellKey(start[0], start[1]);
  const endKey = cellKey(end[0], end[1]);

  const visited = new Set<string>();
  const parent: Record<string, string> = {};
  const distances: Record<string, number> = { [startKey]: 0 };
  const pq = new MinPQ();
  pq.insert(startKey, manhattan(start, end));

  yield {
    type: "init",
    data: {
      grid,
      visited: [],
      frontier: [startKey],
      current: start,
      path: [],
      distances: { ...distances },
      parent: { ...parent },
      visitedCount: 0,
      frontierSize: 1,
      pathLength: 0,
      totalCost: 0,
      phase: "searching",
    },
    description: `Greedy Best-First: Starting, h(start)=${manhattan(start, end)}`,
    codeLine: 2,
    variables: { start, end, heuristic: manhattan(start, end) },
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
          distances: { ...distances },
          parent: { ...parent },
          visitedCount: visited.size,
          frontierSize: pq.size,
          pathLength: path.length,
          totalCost: path.length - 1,
          phase: "path-found",
        },
        description: `Path found! Length: ${path.length} (may not be shortest)`,
        codeLine: 7,
        variables: { pathLength: path.length, visitedCount: visited.size },
      };
      return;
    }

    const neighbors = getNeighbors(cr, cc, rows, cols, allowDiagonal);

    for (const [nr, nc] of neighbors) {
      const nKey = cellKey(nr, nc);
      if (visited.has(nKey) || grid[nr][nc] === CellState.Wall) continue;

      if (parent[nKey] === undefined) {
        parent[nKey] = currentKey;
        distances[nKey] = (distances[currentKey] ?? 0) + 1;
        pq.insert(nKey, manhattan([nr, nc], end));
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
        distances: { ...distances },
        parent: { ...parent },
        visitedCount: visited.size,
        frontierSize: pq.size,
        pathLength: 0,
        totalCost: 0,
        phase: "searching",
      },
      description: `Exploring (${cr},${cc}) h=${manhattan(current, end)}, visited: ${visited.size}`,
      codeLine: 5,
      variables: {
        current,
        heuristic: manhattan(current, end),
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
      distances: { ...distances },
      parent: { ...parent },
      visitedCount: visited.size,
      frontierSize: 0,
      pathLength: 0,
      totalCost: 0,
      phase: "no-path",
    },
    description: "No path found!",
    codeLine: 13,
    variables: { visitedCount: visited.size },
  };
}
