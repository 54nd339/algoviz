import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GridConfig, PathStep } from "./types";
import {
  cellKey,
  CellState,
  getNeighbors,
  getWorkingGrid,
  parseKey,
} from "./types";

export const bidirectionalBfsMeta: AlgorithmMeta = {
  id: "pathfinding-bidirectional-bfs",
  name: "Bidirectional BFS",
  category: "pathfinding",
  description:
    "Runs two BFS searches simultaneously — one from start and one from end. When the frontiers meet, the path is found. Explores roughly half the cells of standard BFS.",
  timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
  spaceComplexity: "O(V)",
  pseudocode: `function bidirectionalBFS(grid, start, end):
  queueF = [start], queueB = [end]
  visitedF = {start}, visitedB = {end}
  parentF = {}, parentB = {}
  while queueF and queueB not empty:
    expand forward frontier
    if any forward neighbor in visitedB:
      meeting = neighbor
      return pathF(start→meeting) + pathB(meeting→end)
    expand backward frontier
    if any backward neighbor in visitedF:
      meeting = neighbor
      return pathF(start→meeting) + pathB(meeting→end)
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
  relatedAlgorithms: ["pathfinding-bfs"],
};

registerAlgorithm(bidirectionalBfsMeta);

function reconstructBidirectionalPath(
  parentF: Record<string, string>,
  parentB: Record<string, string>,
  startKey: string,
  endKey: string,
  meetingKey: string,
): [number, number][] {
  const pathForward: [number, number][] = [];
  let current = meetingKey;
  while (current && current !== startKey) {
    pathForward.unshift(parseKey(current));
    current = parentF[current];
  }
  pathForward.unshift(parseKey(startKey));

  const pathBackward: [number, number][] = [];
  current = parentB[meetingKey];
  while (current && current !== endKey) {
    pathBackward.push(parseKey(current));
    current = parentB[current];
  }
  if (meetingKey !== endKey) {
    pathBackward.push(parseKey(endKey));
  }

  return [...pathForward, ...pathBackward];
}

export function* bidirectionalBfs(
  input: GridConfig,
): AlgorithmGenerator<PathStep> {
  const { rows, cols, start, end, allowDiagonal } = input;
  const grid = getWorkingGrid(input);

  const startKey = cellKey(start[0], start[1]);
  const endKey = cellKey(end[0], end[1]);

  const visitedF = new Set<string>([startKey]);
  const visitedB = new Set<string>([endKey]);
  const parentF: Record<string, string> = {};
  const parentB: Record<string, string> = {};
  let queueF: string[] = [startKey];
  let queueB: string[] = [endKey];

  yield {
    type: "init",
    data: {
      grid,
      visited: [...visitedF, ...visitedB],
      frontier: [...queueF, ...queueB],
      current: start,
      path: [],
      distances: {},
      parent: {},
      visitedCount: 2,
      frontierSize: 2,
      pathLength: 0,
      totalCost: 0,
      phase: "searching",
      visitedForward: [...visitedF],
      visitedBackward: [...visitedB],
      frontierForward: [...queueF],
      frontierBackward: [...queueB],
    },
    description: `Bidirectional BFS: Forward from (${start}) and backward from (${end})`,
    codeLine: 2,
    variables: { start, end },
  };

  while (queueF.length > 0 && queueB.length > 0) {
    // Expand forward
    const nextQueueF: string[] = [];
    for (const currentKey of queueF) {
      const [cr, cc] = currentKey.split(",").map(Number);
      const neighbors = getNeighbors(cr, cc, rows, cols, allowDiagonal);

      for (const [nr, nc] of neighbors) {
        const nKey = cellKey(nr, nc);
        if (grid[nr][nc] === CellState.Wall) continue;

        if (visitedB.has(nKey)) {
          parentF[nKey] = currentKey;
          const path = reconstructBidirectionalPath(
            parentF,
            parentB,
            startKey,
            endKey,
            nKey,
          );
          const meetingPoint: [number, number] = [nr, nc];

          yield {
            type: "path-found",
            data: {
              grid,
              visited: [...visitedF, ...visitedB],
              frontier: [...nextQueueF, ...queueB],
              current: meetingPoint,
              path,
              distances: {},
              parent: {},
              visitedCount: visitedF.size + visitedB.size,
              frontierSize: nextQueueF.length + queueB.length,
              pathLength: path.length,
              totalCost: path.length - 1,
              phase: "path-found",
              visitedForward: [...visitedF],
              visitedBackward: [...visitedB],
              meetingPoint,
            },
            description: `Frontiers met at (${nr},${nc})! Path length: ${path.length}`,
            codeLine: 7,
            variables: {
              meetingPoint,
              pathLength: path.length,
              visitedCount: visitedF.size + visitedB.size,
            },
          };
          return;
        }

        if (!visitedF.has(nKey)) {
          visitedF.add(nKey);
          parentF[nKey] = currentKey;
          nextQueueF.push(nKey);
        }
      }
    }
    queueF = nextQueueF;

    yield {
      type: "expand-forward",
      data: {
        grid,
        visited: [...visitedF, ...visitedB],
        frontier: [...queueF, ...queueB],
        path: [],
        distances: {},
        parent: {},
        visitedCount: visitedF.size + visitedB.size,
        frontierSize: queueF.length + queueB.length,
        pathLength: 0,
        totalCost: 0,
        phase: "searching",
        visitedForward: [...visitedF],
        visitedBackward: [...visitedB],
        frontierForward: [...queueF],
        frontierBackward: [...queueB],
      },
      description: `Forward expanded: ${visitedF.size} visited, ${queueF.length} frontier`,
      codeLine: 5,
      variables: {
        forwardVisited: visitedF.size,
        forwardFrontier: queueF.length,
      },
    };

    // Expand backward
    const nextQueueB: string[] = [];
    for (const currentKey of queueB) {
      const [cr, cc] = currentKey.split(",").map(Number);
      const neighbors = getNeighbors(cr, cc, rows, cols, allowDiagonal);

      for (const [nr, nc] of neighbors) {
        const nKey = cellKey(nr, nc);
        if (grid[nr][nc] === CellState.Wall) continue;

        if (visitedF.has(nKey)) {
          parentB[nKey] = currentKey;
          const path = reconstructBidirectionalPath(
            parentF,
            parentB,
            startKey,
            endKey,
            nKey,
          );
          const meetingPoint: [number, number] = [nr, nc];

          yield {
            type: "path-found",
            data: {
              grid,
              visited: [...visitedF, ...visitedB],
              frontier: [...queueF, ...nextQueueB],
              current: meetingPoint,
              path,
              distances: {},
              parent: {},
              visitedCount: visitedF.size + visitedB.size,
              frontierSize: queueF.length + nextQueueB.length,
              pathLength: path.length,
              totalCost: path.length - 1,
              phase: "path-found",
              visitedForward: [...visitedF],
              visitedBackward: [...visitedB],
              meetingPoint,
            },
            description: `Frontiers met at (${nr},${nc})! Path length: ${path.length}`,
            codeLine: 10,
            variables: { meetingPoint, pathLength: path.length },
          };
          return;
        }

        if (!visitedB.has(nKey)) {
          visitedB.add(nKey);
          parentB[nKey] = currentKey;
          nextQueueB.push(nKey);
        }
      }
    }
    queueB = nextQueueB;

    yield {
      type: "expand-backward",
      data: {
        grid,
        visited: [...visitedF, ...visitedB],
        frontier: [...queueF, ...queueB],
        path: [],
        distances: {},
        parent: {},
        visitedCount: visitedF.size + visitedB.size,
        frontierSize: queueF.length + queueB.length,
        pathLength: 0,
        totalCost: 0,
        phase: "searching",
        visitedForward: [...visitedF],
        visitedBackward: [...visitedB],
        frontierForward: [...queueF],
        frontierBackward: [...queueB],
      },
      description: `Backward expanded: ${visitedB.size} visited, ${queueB.length} frontier`,
      codeLine: 9,
      variables: {
        backwardVisited: visitedB.size,
        backwardFrontier: queueB.length,
      },
    };
  }

  yield {
    type: "no-path",
    data: {
      grid,
      visited: [...visitedF, ...visitedB],
      frontier: [],
      path: [],
      distances: {},
      parent: {},
      visitedCount: visitedF.size + visitedB.size,
      frontierSize: 0,
      pathLength: 0,
      totalCost: 0,
      phase: "no-path",
      visitedForward: [...visitedF],
      visitedBackward: [...visitedB],
    },
    description: "No path found!",
    codeLine: 12,
    variables: { visitedCount: visitedF.size + visitedB.size },
  };
}
