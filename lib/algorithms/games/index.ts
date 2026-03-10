export { fifteenPuzzle, fifteenPuzzleMeta } from "./fifteen-puzzle";
export { gameOfLife, gameOfLifeMeta } from "./game-of-life";
export { getGameType } from "./game-type";
export { knightTour, knightTourMeta } from "./knight-tour";
export { minimax, minimaxMeta } from "./minimax";
export { nQueens, nQueensMeta } from "./n-queens";
export { sudokuMeta, sudokuSolver } from "./sudoku-solver";
export { hanoiMeta, towerOfHanoi } from "./tower-of-hanoi";
export type {
  GameStep,
  HanoiStep,
  KnightStep,
  LifeStep,
  MinimaxStep,
  PuzzleStep,
  QueenStep,
  SudokuStep,
} from "./types";

import type { AlgorithmStep } from "@/types";

import { fifteenPuzzle } from "./fifteen-puzzle";
import { gameOfLife } from "./game-of-life";
import { knightTour } from "./knight-tour";
import { minimax } from "./minimax";
import { nQueens } from "./n-queens";
import { sudokuSolver } from "./sudoku-solver";
import { towerOfHanoi } from "./tower-of-hanoi";
import type { GameStep } from "./types";

export const GAMES_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<GameStep>, void, undefined>
> = {
  minimax: (input) =>
    minimax(input as { board: (string | null)[] }) as Generator<
      AlgorithmStep<GameStep>,
      void,
      undefined
    >,
  "tower-of-hanoi": (input) =>
    towerOfHanoi(input as { numDisks: number }) as Generator<
      AlgorithmStep<GameStep>,
      void,
      undefined
    >,
  "sudoku-solver": (input) =>
    sudokuSolver(input as { grid: (number | null)[][] }) as Generator<
      AlgorithmStep<GameStep>,
      void,
      undefined
    >,
  "game-of-life": (input) =>
    gameOfLife(
      input as { grid: boolean[][]; generations?: number },
    ) as Generator<AlgorithmStep<GameStep>, void, undefined>,
  "knight-tour": (input) =>
    knightTour(
      input as { size: number; startRow: number; startCol: number },
    ) as Generator<AlgorithmStep<GameStep>, void, undefined>,
  "n-queens": (input) =>
    nQueens(input as { n: number }) as Generator<
      AlgorithmStep<GameStep>,
      void,
      undefined
    >,
  "fifteen-puzzle": (input) =>
    fifteenPuzzle(
      input as { grid: (number | null)[][]; maxSteps?: number },
    ) as Generator<AlgorithmStep<GameStep>, void, undefined>,
};
