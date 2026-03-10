import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { PuzzleStep } from "./types";

export const fifteenPuzzleMeta: AlgorithmMeta = {
  id: "fifteen-puzzle",
  name: "15-Puzzle (A*)",
  category: "games",
  description:
    "Solves the 15-puzzle (4×4 sliding tile puzzle) using A* search with the Manhattan distance heuristic. Guarantees finding the shortest solution path.",
  timeComplexity: { best: "O(1)", average: "O(b^d)", worst: "O(b^d)" },
  spaceComplexity: "O(b^d)",
  pseudocode: `function aStar(start):
  open = PriorityQueue([start])
  while open not empty:
    state = open.popMin()
    if state == goal: reconstruct path
    for each neighbor of state:
      g = state.g + 1
      h = manhattan(neighbor)
      if better path:
        add neighbor to open`,
  presets: [
    {
      name: "Easy (5 moves)",
      generator: () => ({ grid: scramble(5), maxSteps: 200 }),
      expectedCase: "best",
    },
    {
      name: "Medium (15 moves)",
      generator: () => ({ grid: scramble(15), maxSteps: 500 }),
      expectedCase: "average",
    },
    {
      name: "Hard (25 moves)",
      generator: () => ({ grid: scramble(25), maxSteps: 1000 }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Any random arrangement of tiles is solvable.",
      reality:
        "Exactly half of all possible permutations are solvable. The parity of the permutation (plus the blank row) determines solvability.",
    },
  ],
  relatedAlgorithms: ["sudoku-solver"],
};

registerAlgorithm(fifteenPuzzleMeta);

const GOAL: number[][] = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 0],
];

function scramble(moves: number): (number | null)[][] {
  const grid = GOAL.map((r) => [...r]);
  let er = 3,
    ec = 3;
  const dirs: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  let lastDir = -1;

  for (let i = 0; i < moves; i++) {
    const valid = dirs
      .map((d, idx) => ({ d, idx }))
      .filter(({ d, idx }) => {
        const nr = er + d[0];
        const nc = ec + d[1];
        const opposite = [1, 0, 3, 2];
        return (
          nr >= 0 && nr < 4 && nc >= 0 && nc < 4 && idx !== opposite[lastDir]
        );
      });
    const { d, idx } = valid[Math.floor(Math.random() * valid.length)];
    const nr = er + d[0];
    const nc = ec + d[1];
    grid[er][ec] = grid[nr][nc];
    grid[nr][nc] = 0;
    er = nr;
    ec = nc;
    lastDir = idx;
  }

  return grid.map((r) => r.map((v) => (v === 0 ? null : v)));
}

function manhattan(grid: (number | null)[][]): number {
  let dist = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = grid[r][c];
      if (val === null || val === 0) continue;
      const goalR = Math.floor((val - 1) / 4);
      const goalC = (val - 1) % 4;
      dist += Math.abs(r - goalR) + Math.abs(c - goalC);
    }
  }
  return dist;
}

function findEmpty(grid: (number | null)[][]): [number, number] {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === null) return [r, c];
    }
  }
  return [3, 3];
}

function gridKey(grid: (number | null)[][]): string {
  return grid
    .flat()
    .map((v) => (v === null ? "0" : String(v)))
    .join(",");
}

interface AStarNode {
  grid: (number | null)[][];
  emptyPos: [number, number];
  g: number;
  h: number;
  parent: AStarNode | null;
  moveDir?: "up" | "down" | "left" | "right";
}

const DIR_NAMES: Record<string, "up" | "down" | "left" | "right"> = {
  "-1,0": "up",
  "1,0": "down",
  "0,-1": "left",
  "0,1": "right",
};

export function* fifteenPuzzle(input: {
  grid: (number | null)[][];
  maxSteps?: number;
}): AlgorithmGenerator<PuzzleStep> {
  const startGrid = input.grid.map((r) => [...r]);
  const maxSteps = input.maxSteps ?? 500;
  const startEmpty = findEmpty(startGrid);
  const startH = manhattan(startGrid);

  yield {
    type: "init",
    data: {
      grid: startGrid.map((r) => [...r]),
      emptyPos: startEmpty,
      moveCount: 0,
      manhattan: startH,
    },
    description: `15-Puzzle: Manhattan distance = ${startH}. Running A* search...`,
    codeLine: 1,
    variables: { manhattan: startH },
  };

  const open: AStarNode[] = [
    {
      grid: startGrid.map((r) => [...r]),
      emptyPos: startEmpty,
      g: 0,
      h: startH,
      parent: null,
    },
  ];
  const closed = new Set<string>();
  let explored = 0;

  const dirs: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  let goalNode: AStarNode | null = null;

  while (open.length > 0 && explored < maxSteps) {
    open.sort((a, b) => a.g + a.h - (b.g + b.h));
    const current = open.shift()!;
    const key = gridKey(current.grid);

    if (closed.has(key)) continue;
    closed.add(key);
    explored++;

    if (current.h === 0) {
      goalNode = current;
      break;
    }

    if (explored % 20 === 0) {
      yield {
        type: "searching",
        data: {
          grid: current.grid.map((r) => [...r]),
          emptyPos: current.emptyPos,
          moveCount: current.g,
          manhattan: current.h,
        },
        description: `A* exploring... ${explored} states checked, f=${current.g + current.h}`,
        codeLine: 4,
        variables: {
          explored,
          g: current.g,
          h: current.h,
          f: current.g + current.h,
          openSize: open.length,
        },
      };
    }

    const [er, ec] = current.emptyPos;
    for (const [dr, dc] of dirs) {
      const nr = er + dr;
      const nc = ec + dc;
      if (nr < 0 || nr >= 4 || nc < 0 || nc >= 4) continue;

      const newGrid = current.grid.map((r) => [...r]);
      newGrid[er][ec] = newGrid[nr][nc];
      newGrid[nr][nc] = null;

      const nKey = gridKey(newGrid);
      if (closed.has(nKey)) continue;

      open.push({
        grid: newGrid,
        emptyPos: [nr, nc],
        g: current.g + 1,
        h: manhattan(newGrid),
        parent: current,
        moveDir: DIR_NAMES[`${dr},${dc}`],
      });
    }
  }

  if (!goalNode) {
    yield {
      type: "no-solution",
      data: {
        grid: startGrid.map((r) => [...r]),
        emptyPos: startEmpty,
        moveCount: 0,
        manhattan: startH,
      },
      description: `Could not find solution within ${maxSteps} states explored`,
      variables: { explored },
    };
    return;
  }

  const path: AStarNode[] = [];
  let node: AStarNode | null = goalNode;
  while (node) {
    path.unshift(node);
    node = node.parent;
  }

  yield {
    type: "solution-found",
    data: {
      grid: startGrid.map((r) => [...r]),
      emptyPos: startEmpty,
      moveCount: 0,
      manhattan: startH,
    },
    description: `Solution found! ${path.length - 1} moves, ${explored} states explored. Animating...`,
    codeLine: 6,
    variables: { solutionLength: path.length - 1, explored },
  };

  for (let i = 1; i < path.length; i++) {
    const step = path[i];
    yield {
      type: "slide",
      data: {
        grid: step.grid.map((r) => [...r]),
        emptyPos: step.emptyPos,
        moveDirection: step.moveDir,
        moveCount: i,
        manhattan: step.h,
      },
      description: `Move ${i}/${path.length - 1}: slide ${step.moveDir} — Manhattan = ${step.h}`,
      codeLine: 7,
      variables: {
        move: i,
        total: path.length - 1,
        direction: step.moveDir,
        manhattan: step.h,
      },
    };
  }

  yield {
    type: "done",
    data: {
      grid: goalNode.grid.map((r) => [...r]),
      emptyPos: goalNode.emptyPos,
      moveCount: path.length - 1,
      manhattan: 0,
    },
    description: `Puzzle solved in ${path.length - 1} moves!`,
    variables: { totalMoves: path.length - 1, statesExplored: explored },
  };
}
