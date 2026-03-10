export interface MinimaxStep {
  board: (string | null)[];
  currentPlayer: "X" | "O";
  evaluationScores?: Record<string, number>;
  bestMove?: number;
  pruned?: string[];
  alpha: number;
  beta: number;
  depth: number;
  winner?: string | null;
  winLine?: number[];
  /** "explore" | "terminal" | "prune" | "backtrack" | "ai-move" | "player-move" | "game-over" | "init" */
  phase?: string;
  /** Whether the current level is maximizing (O/AI) or minimizing (X/human) */
  isMaximizing?: boolean;
  /** Sequence of moves from root to current node, e.g. [{pos:4, player:"X"}, {pos:0, player:"O"}] */
  path?: { pos: number; player: string }[];
  /** Score returned from a terminal or backtrack step */
  score?: number;
}

export interface HanoiStep {
  pegs: number[][];
  movingDisk: number;
  from: number;
  to: number;
  moveNumber: number;
  totalMoves: number;
}

export interface SudokuStep {
  grid: (number | null)[][];
  currentCell: [number, number];
  trying?: number;
  conflicts: [number, number][];
  placed: [number, number][];
  backtracking: boolean;
}

export interface LifeStep {
  grid: boolean[][];
  generation: number;
  population: number;
  births: [number, number][];
  deaths: [number, number][];
}

export interface KnightStep {
  board: (number | null)[][];
  currentPos: [number, number];
  moveNumber: number;
  possibleMoves: [number, number][];
  backtracking: boolean;
  path: [number, number][];
}

export interface QueenStep {
  board: boolean[][];
  currentRow: number;
  currentCol: number;
  conflicts: [number, number][];
  placed: [number, number][];
  backtracking: boolean;
  n: number;
}

export interface PuzzleStep {
  grid: (number | null)[][];
  emptyPos: [number, number];
  moveDirection?: "up" | "down" | "left" | "right";
  moveCount: number;
  manhattan: number;
}

export type GameStep =
  | MinimaxStep
  | HanoiStep
  | SudokuStep
  | LifeStep
  | KnightStep
  | QueenStep
  | PuzzleStep;
