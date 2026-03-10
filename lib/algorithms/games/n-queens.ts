import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { QueenStep } from "./types";

export const nQueensMeta: AlgorithmMeta = {
  id: "n-queens",
  name: "N-Queens",
  category: "games",
  description:
    "Place N queens on an N×N chessboard so no two queens threaten each other. Uses backtracking: places queens row by row, checking column and diagonal conflicts, and backtracks when no valid column exists.",
  timeComplexity: { best: "O(n!)", average: "O(n!)", worst: "O(n!)" },
  spaceComplexity: "O(n²)",
  pseudocode: `function placeQueens(board, row):
  if row == n: return true  // all placed
  for col = 0 to n-1:
    if isSafe(board, row, col):
      board[row][col] = true
      if placeQueens(board, row+1):
        return true
      board[row][col] = false  // backtrack
  return false`,
  presets: [
    {
      name: "4 Queens",
      generator: () => ({ n: 4 }),
      expectedCase: "best",
    },
    {
      name: "6 Queens",
      generator: () => ({ n: 6 }),
      expectedCase: "average",
    },
    {
      name: "8 Queens",
      generator: () => ({ n: 8 }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "N-Queens has only one solution for each N.",
      reality:
        "The number of solutions grows rapidly: 4-Queens has 2 solutions, 8-Queens has 92, and 12-Queens has 14,200. This algorithm finds the first valid placement.",
    },
  ],
  relatedAlgorithms: ["knight-tour", "sudoku-solver"],
};

registerAlgorithm(nQueensMeta);

function getConflicts(
  board: boolean[][],
  row: number,
  col: number,
  n: number,
): [number, number][] {
  const conflicts: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    if (i !== row && board[i][col]) conflicts.push([i, col]);
  }
  for (let i = 0; i < n; i++) {
    if (i !== col && board[row][i]) conflicts.push([row, i]);
  }
  for (let d = 1; d < n; d++) {
    if (row - d >= 0 && col - d >= 0 && board[row - d][col - d])
      conflicts.push([row - d, col - d]);
    if (row - d >= 0 && col + d < n && board[row - d][col + d])
      conflicts.push([row - d, col + d]);
    if (row + d < n && col - d >= 0 && board[row + d][col - d])
      conflicts.push([row + d, col - d]);
    if (row + d < n && col + d < n && board[row + d][col + d])
      conflicts.push([row + d, col + d]);
  }

  return conflicts;
}

function isSafe(
  board: boolean[][],
  row: number,
  col: number,
  n: number,
): boolean {
  for (let i = 0; i < row; i++) {
    if (board[i][col]) return false;
  }
  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j]) return false;
  }
  for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
    if (board[i][j]) return false;
  }
  return true;
}

export function* nQueens(input: { n: number }): AlgorithmGenerator<QueenStep> {
  const n = Math.min(Math.max(input.n, 4), 12);
  const board: boolean[][] = Array.from({ length: n }, () =>
    Array(n).fill(false),
  );
  const placed: [number, number][] = [];

  yield {
    type: "init",
    data: {
      board: board.map((r) => [...r]),
      currentRow: 0,
      currentCol: 0,
      conflicts: [],
      placed: [],
      backtracking: false,
      n,
    },
    description: `Place ${n} queens on a ${n}×${n} board — no two may share a row, column, or diagonal`,
    codeLine: 1,
    variables: { n },
    callStack: [{ name: "placeQueens", args: { row: 0 } }],
  };

  let solved = false;

  function* solve(
    row: number,
  ): Generator<
    {
      type: string;
      data: QueenStep;
      description: string;
      codeLine?: number;
      variables?: Record<string, unknown>;
      callStack?: { name: string; args: Record<string, unknown> }[];
    },
    boolean,
    undefined
  > {
    if (row === n) return true;

    for (let col = 0; col < n; col++) {
      const safe = isSafe(board, row, col, n);
      const conflicts = safe ? [] : getConflicts(board, row, col, n);

      yield {
        type: safe ? "try-safe" : "try-conflict",
        data: {
          board: board.map((r) => [...r]),
          currentRow: row,
          currentCol: col,
          conflicts,
          placed: [...placed],
          backtracking: false,
          n,
        },
        description: safe
          ? `Row ${row}, col ${col}: safe — placing queen`
          : `Row ${row}, col ${col}: conflicts with ${conflicts.length} queen(s)`,
        codeLine: safe ? 4 : 3,
        variables: { row, col, safe, conflicts: conflicts.length },
        callStack: [{ name: "placeQueens", args: { row } }],
      };

      if (!safe) continue;

      board[row][col] = true;
      placed.push([row, col]);

      yield {
        type: "place",
        data: {
          board: board.map((r) => [...r]),
          currentRow: row,
          currentCol: col,
          conflicts: [],
          placed: [...placed],
          backtracking: false,
          n,
        },
        description: `Queen placed at (${row},${col}) — ${placed.length}/${n} queens`,
        codeLine: 5,
        variables: { row, col, queensPlaced: placed.length },
        callStack: [{ name: "placeQueens", args: { row } }],
      };

      if (yield* solve(row + 1)) return true;

      board[row][col] = false;
      placed.pop();

      yield {
        type: "backtrack",
        data: {
          board: board.map((r) => [...r]),
          currentRow: row,
          currentCol: col,
          conflicts: [],
          placed: [...placed],
          backtracking: true,
          n,
        },
        description: `Backtrack: remove queen from (${row},${col})`,
        codeLine: 8,
        variables: { row, col, queensPlaced: placed.length },
        callStack: [{ name: "placeQueens", args: { row } }],
      };
    }

    return false;
  }

  solved = yield* solve(0);

  yield {
    type: solved ? "done" : "no-solution",
    data: {
      board: board.map((r) => [...r]),
      currentRow: n - 1,
      currentCol: 0,
      conflicts: [],
      placed: [...placed],
      backtracking: false,
      n,
    },
    description: solved
      ? `All ${n} queens placed successfully!`
      : `No solution found for ${n}-Queens.`,
    variables: { solved, queensPlaced: placed.length },
  };
}
