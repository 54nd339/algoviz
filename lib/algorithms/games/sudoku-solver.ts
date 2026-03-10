import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SudokuStep } from "./types";

export const sudokuMeta: AlgorithmMeta = {
  id: "sudoku-solver",
  name: "Sudoku Solver",
  category: "games",
  description:
    "Solves Sudoku puzzles using backtracking with constraint checking. Tries numbers 1-9 in each empty cell, validating row, column, and 3x3 box constraints, and backtracks when a conflict is found.",
  timeComplexity: { best: "O(1)", average: "O(9^m)", worst: "O(9^m)" },
  spaceComplexity: "O(m)",
  pseudocode: `function solve(grid):
  cell = findEmpty(grid)
  if no empty cell: return true
  for num = 1 to 9:
    if isValid(grid, cell, num):
      grid[cell] = num
      if solve(grid): return true
      grid[cell] = null  // backtrack
  return false`,
  presets: [
    {
      name: "Easy",
      generator: () => ({
        grid: [
          [5, 3, null, null, 7, null, null, null, null],
          [6, null, null, 1, 9, 5, null, null, null],
          [null, 9, 8, null, null, null, null, 6, null],
          [8, null, null, null, 6, null, null, null, 3],
          [4, null, null, 8, null, 3, null, null, 1],
          [7, null, null, null, 2, null, null, null, 6],
          [null, 6, null, null, null, null, 2, 8, null],
          [null, null, null, 4, 1, 9, null, null, 5],
          [null, null, null, null, 8, null, null, 7, 9],
        ],
      }),
      expectedCase: "best",
    },
    {
      name: "Medium",
      generator: () => ({
        grid: [
          [null, null, null, 2, 6, null, 7, null, 1],
          [6, 8, null, null, 7, null, null, 9, null],
          [1, 9, null, null, null, 4, 5, null, null],
          [8, 2, null, 1, null, null, null, 4, null],
          [null, null, 4, 6, null, 2, 9, null, null],
          [null, 5, null, null, null, 3, null, 2, 8],
          [null, null, 9, 3, null, null, null, 7, 4],
          [null, 4, null, null, 5, null, null, 3, 6],
          [7, null, 3, null, 1, 8, null, null, null],
        ],
      }),
      expectedCase: "average",
    },
    {
      name: "Hard",
      generator: () => ({
        grid: [
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, 3, null, 8, 5],
          [null, null, 1, null, 2, null, null, null, null],
          [null, null, null, 5, null, 7, null, null, null],
          [null, null, 4, null, null, null, 1, null, null],
          [null, 9, null, null, null, null, null, null, null],
          [5, null, null, null, null, null, null, 7, 3],
          [null, null, 2, null, 1, null, null, null, null],
          [null, null, null, null, 4, null, null, null, 9],
        ],
      }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Sudoku solving always requires brute force.",
      reality:
        "Constraint propagation (naked singles, hidden singles) can solve easy puzzles without any backtracking. Backtracking is only needed for harder puzzles.",
    },
  ],
  relatedAlgorithms: ["n-queens", "minimax"],
};

registerAlgorithm(sudokuMeta);

function getCandidates(
  grid: (number | null)[][],
  row: number,
  col: number,
): number[] {
  const used = new Set<number>();
  for (let j = 0; j < 9; j++) {
    if (grid[row][j] !== null) used.add(grid[row][j]!);
  }
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] !== null) used.add(grid[i][col]!);
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      if (grid[i][j] !== null) used.add(grid[i][j]!);
    }
  }
  const candidates: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (!used.has(n)) candidates.push(n);
  }
  return candidates;
}

/** MRV heuristic: pick the empty cell with fewest valid candidates. */
function findEmpty(grid: (number | null)[][]): [number, number] | null {
  let best: [number, number] | null = null;
  let bestCount = 10;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === null) {
        const count = getCandidates(grid, i, j).length;
        if (count < bestCount) {
          bestCount = count;
          best = [i, j];
          if (count <= 1) return best;
        }
      }
    }
  }
  return best;
}

export function* sudokuSolver(input: {
  grid: (number | null)[][];
}): AlgorithmGenerator<SudokuStep> {
  const grid = input.grid.map((row) => [...row]);
  const placed: [number, number][] = [];

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] !== null) placed.push([i, j]);
    }
  }

  yield {
    type: "init",
    data: {
      grid: grid.map((r) => [...r]),
      currentCell: [0, 0],
      conflicts: [],
      placed: [...placed],
      backtracking: false,
    },
    description: `Sudoku puzzle loaded — ${placed.length} given cells, ${81 - placed.length} to solve`,
    codeLine: 1,
    variables: { givenCells: placed.length, emptyCells: 81 - placed.length },
  };

  let solved = false;

  function* solve(
    depth: number,
  ): Generator<
    {
      type: string;
      data: SudokuStep;
      description: string;
      codeLine?: number;
      variables?: Record<string, unknown>;
      callStack?: { name: string; args: Record<string, unknown> }[];
    },
    boolean,
    undefined
  > {
    const cell = findEmpty(grid);
    if (!cell) return true;

    const [row, col] = cell;
    const candidates = getCandidates(grid, row, col);

    for (const num of candidates) {
      yield {
        type: "try",
        data: {
          grid: grid.map((r) => [...r]),
          currentCell: [row, col],
          trying: num,
          conflicts: [],
          placed: [...placed],
          backtracking: false,
        },
        description: `Trying ${num} at (${row},${col}) — valid`,
        codeLine: 5,
        variables: { row, col, num, candidates: candidates.length, depth },
        callStack: [{ name: "solve", args: { row, col, depth } }],
      };

      grid[row][col] = num;
      placed.push([row, col]);

      yield {
        type: "place",
        data: {
          grid: grid.map((r) => [...r]),
          currentCell: [row, col],
          conflicts: [],
          placed: [...placed],
          backtracking: false,
        },
        description: `Placed ${num} at (${row},${col})`,
        codeLine: 6,
        variables: { row, col, num, depth },
        callStack: [{ name: "solve", args: { row, col, depth } }],
      };

      if (yield* solve(depth + 1)) return true;

      grid[row][col] = null;
      placed.pop();

      yield {
        type: "backtrack",
        data: {
          grid: grid.map((r) => [...r]),
          currentCell: [row, col],
          conflicts: [],
          placed: [...placed],
          backtracking: true,
        },
        description: `Backtracking: removing ${num} from (${row},${col})`,
        codeLine: 8,
        variables: { row, col, num, depth },
        callStack: [{ name: "solve", args: { row, col, depth } }],
      };
    }

    return false;
  }

  solved = yield* solve(0);

  yield {
    type: solved ? "done" : "no-solution",
    data: {
      grid: grid.map((r) => [...r]),
      currentCell: [0, 0],
      conflicts: [],
      placed: [...placed],
      backtracking: false,
    },
    description: solved
      ? "Sudoku solved!"
      : "No solution exists for this puzzle.",
    variables: { solved },
  };
}
