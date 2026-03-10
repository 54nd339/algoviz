import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { KnightStep } from "./types";

export const knightTourMeta: AlgorithmMeta = {
  id: "knight-tour",
  name: "Knight's Tour",
  category: "games",
  description:
    "Finds a path for a knight to visit every square on a chessboard exactly once. Uses Warnsdorff's heuristic (move to the square with fewest onward moves) with backtracking as fallback.",
  timeComplexity: { best: "O(n²)", average: "O(8^(n²))", worst: "O(8^(n²))" },
  spaceComplexity: "O(n²)",
  pseudocode: `function knightTour(board, pos, moveNum):
  if moveNum == n*n: return true
  moves = getValidMoves(pos)
  sort moves by Warnsdorff (fewest onward)
  for each move:
    board[move] = moveNum
    if knightTour(board, move, moveNum+1):
      return true
    board[move] = null  // backtrack
  return false`,
  presets: [
    {
      name: "Corner Start (0,0)",
      generator: () => ({ size: 8, startRow: 0, startCol: 0 }),
      expectedCase: "average",
    },
    {
      name: "Center Start (3,3)",
      generator: () => ({ size: 8, startRow: 3, startCol: 3 }),
      expectedCase: "best",
    },
    {
      name: "5x5 Board",
      generator: () => ({ size: 5, startRow: 0, startCol: 0 }),
      expectedCase: "average",
    },
    {
      name: "6x6 Board",
      generator: () => ({ size: 6, startRow: 0, startCol: 0 }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "A knight's tour is impossible on small boards.",
      reality:
        "A knight's tour exists on any n×n board for n ≥ 5. On 5×5 boards, only open tours exist; closed tours require n ≥ 6 (even dimensions).",
    },
  ],
  relatedAlgorithms: ["n-queens", "game-of-life"],
};

registerAlgorithm(knightTourMeta);

const MOVES = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];

function getValidMoves(
  board: (number | null)[][],
  row: number,
  col: number,
  size: number,
): [number, number][] {
  const moves: [number, number][] = [];
  for (const [dr, dc] of MOVES) {
    const nr = row + dr;
    const nc = col + dc;
    if (
      nr >= 0 &&
      nr < size &&
      nc >= 0 &&
      nc < size &&
      board[nr][nc] === null
    ) {
      moves.push([nr, nc]);
    }
  }
  return moves;
}

function warnsdorffSort(
  moves: [number, number][],
  board: (number | null)[][],
  size: number,
): [number, number][] {
  return [...moves].sort((a, b) => {
    const aCount = getValidMoves(board, a[0], a[1], size).length;
    const bCount = getValidMoves(board, b[0], b[1], size).length;
    return aCount - bCount;
  });
}

export function* knightTour(input: {
  size: number;
  startRow: number;
  startCol: number;
}): AlgorithmGenerator<KnightStep> {
  const size = Math.min(Math.max(input.size, 5), 8);
  const board: (number | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null),
  );
  const path: [number, number][] = [];
  const totalSquares = size * size;

  board[input.startRow][input.startCol] = 0;
  path.push([input.startRow, input.startCol]);

  yield {
    type: "init",
    data: {
      board: board.map((r) => [...r]),
      currentPos: [input.startRow, input.startCol],
      moveNumber: 0,
      possibleMoves: getValidMoves(board, input.startRow, input.startCol, size),
      backtracking: false,
      path: [...path],
    },
    description: `Knight starts at (${input.startRow},${input.startCol}) on ${size}x${size} board`,
    codeLine: 1,
    variables: {
      size,
      totalSquares,
      startRow: input.startRow,
      startCol: input.startCol,
    },
    callStack: [
      {
        name: "knightTour",
        args: { pos: `(${input.startRow},${input.startCol})`, moveNum: 0 },
      },
    ],
  };

  let found = false;

  function* solve(
    row: number,
    col: number,
    moveNum: number,
  ): Generator<
    {
      type: string;
      data: KnightStep;
      description: string;
      codeLine?: number;
      variables?: Record<string, unknown>;
      callStack?: { name: string; args: Record<string, unknown> }[];
    },
    boolean,
    undefined
  > {
    if (moveNum === totalSquares - 1) return true;

    const valid = getValidMoves(board, row, col, size);
    const sorted = warnsdorffSort(valid, board, size);

    yield {
      type: "explore",
      data: {
        board: board.map((r) => [...r]),
        currentPos: [row, col],
        moveNumber: moveNum,
        possibleMoves: sorted,
        backtracking: false,
        path: [...path],
      },
      description: `At (${row},${col}), move ${moveNum}: ${sorted.length} possible moves`,
      codeLine: 3,
      variables: { row, col, moveNum, possibleMoves: sorted.length },
      callStack: [
        { name: "knightTour", args: { pos: `(${row},${col})`, moveNum } },
      ],
    };

    for (const [nr, nc] of sorted) {
      board[nr][nc] = moveNum + 1;
      path.push([nr, nc]);

      yield {
        type: "move",
        data: {
          board: board.map((r) => [...r]),
          currentPos: [nr, nc],
          moveNumber: moveNum + 1,
          possibleMoves: getValidMoves(board, nr, nc, size),
          backtracking: false,
          path: [...path],
        },
        description: `Move ${moveNum + 1}: knight to (${nr},${nc})`,
        codeLine: 6,
        variables: { row: nr, col: nc, moveNum: moveNum + 1 },
        callStack: [
          {
            name: "knightTour",
            args: { pos: `(${nr},${nc})`, moveNum: moveNum + 1 },
          },
        ],
      };

      if (yield* solve(nr, nc, moveNum + 1)) return true;

      board[nr][nc] = null;
      path.pop();

      yield {
        type: "backtrack",
        data: {
          board: board.map((r) => [...r]),
          currentPos: [row, col],
          moveNumber: moveNum,
          possibleMoves: [],
          backtracking: true,
          path: [...path],
        },
        description: `Backtrack from (${nr},${nc}) to (${row},${col})`,
        codeLine: 9,
        variables: { row, col, moveNum },
        callStack: [
          { name: "knightTour", args: { pos: `(${row},${col})`, moveNum } },
        ],
      };
    }

    return false;
  }

  found = yield* solve(input.startRow, input.startCol, 0);

  yield {
    type: found ? "done" : "no-solution",
    data: {
      board: board.map((r) => [...r]),
      currentPos: path[path.length - 1] ?? [input.startRow, input.startCol],
      moveNumber: path.length - 1,
      possibleMoves: [],
      backtracking: false,
      path: [...path],
    },
    description: found
      ? `Knight's tour complete! Visited all ${totalSquares} squares.`
      : "No complete tour found from this starting position.",
    variables: { found, visited: path.length },
  };
}
