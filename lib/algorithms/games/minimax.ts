import type { AlgorithmGenerator } from "@/types";

import { registerAlgorithm } from "../registry";
import { minimaxMeta } from "./minimax.meta";
import type { MinimaxStep } from "./types";

export { minimaxMeta };
registerAlgorithm(minimaxMeta);

function checkWinner(board: (string | null)[]): {
  winner: string | null;
  line: number[] | null;
} {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

function evaluate(board: (string | null)[]): number | null {
  const { winner } = checkWinner(board);
  if (winner === "O") return 10;
  if (winner === "X") return -10;
  if (board.every((c) => c !== null)) return 0;
  return null;
}

export function* minimax(input: {
  board: (string | null)[];
}): AlgorithmGenerator<MinimaxStep> {
  const board = [...input.board];

  yield {
    type: "init",
    data: {
      board: [...board],
      currentPlayer: "X",
      alpha: -Infinity,
      beta: Infinity,
      depth: 0,
      phase: "init",
      path: [],
    },
    description: "Initial board state — X plays first, AI plays O",
    codeLine: 1,
    variables: { turn: "X" },
  };

  function* minimaxSearch(
    b: (string | null)[],
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number,
    path: { pos: number; player: string }[],
  ): Generator<
    {
      type: string;
      data: MinimaxStep;
      description: string;
      codeLine?: number;
      variables?: Record<string, unknown>;
      callStack?: { name: string; args: Record<string, unknown> }[];
      reasoning?: string;
    },
    number,
    undefined
  > {
    const score = evaluate(b);
    if (score !== null) {
      const { line } = checkWinner(b);
      yield {
        type: "terminal",
        data: {
          board: [...b],
          currentPlayer: isMaximizing ? "O" : "X",
          alpha,
          beta,
          depth,
          winner: checkWinner(b).winner,
          winLine: line ?? undefined,
          phase: "terminal",
          isMaximizing,
          path: [...path],
          score,
        },
        description: `Terminal: score = ${score}${score > 0 ? " (O wins)" : score < 0 ? " (X wins)" : " (draw)"}`,
        codeLine: 2,
        variables: { score, depth },
        callStack: [
          { name: "minimax", args: { depth, isMaximizing, alpha, beta } },
        ],
      };
      return score;
    }

    const player = isMaximizing ? "O" : "X";
    let best = isMaximizing ? -Infinity : Infinity;
    const scores: Record<string, number> = {};
    const pruned: string[] = [];
    let bestMove: number | undefined;

    for (let i = 0; i < 9; i++) {
      if (b[i] !== null) continue;

      b[i] = player;
      const childPath = [...path, { pos: i, player }];

      yield {
        type: "explore",
        data: {
          board: [...b],
          currentPlayer: player,
          alpha,
          beta,
          depth,
          bestMove,
          evaluationScores: { ...scores },
          phase: "explore",
          isMaximizing,
          path: childPath,
        },
        description: `${isMaximizing ? "MAX" : "MIN"} depth ${depth}: trying ${player} at cell ${i}`,
        codeLine: isMaximizing ? 5 : 11,
        variables: { move: i, depth, alpha, beta, best },
        callStack: [
          { name: "minimax", args: { depth, isMaximizing, alpha, beta } },
        ],
      };

      const val = yield* minimaxSearch(
        b,
        depth + 1,
        !isMaximizing,
        alpha,
        beta,
        childPath,
      );
      b[i] = null;
      scores[String(i)] = val;

      if (isMaximizing) {
        if (val > best) {
          best = val;
          bestMove = i;
        }
        alpha = Math.max(alpha, best);
      } else {
        if (val < best) {
          best = val;
          bestMove = i;
        }
        beta = Math.min(beta, best);
      }

      if (beta <= alpha) {
        for (let j = i + 1; j < 9; j++) {
          if (b[j] === null) pruned.push(String(j));
        }
        yield {
          type: "prune",
          data: {
            board: [...b],
            currentPlayer: player,
            alpha,
            beta,
            depth,
            pruned: [...pruned],
            evaluationScores: { ...scores },
            phase: "prune",
            isMaximizing,
            path: [...path],
          },
          description: `✂ Pruned ${pruned.length} branch${pruned.length > 1 ? "es" : ""} at depth ${depth}: β(${beta}) ≤ α(${alpha})`,
          codeLine: isMaximizing ? 8 : 14,
          variables: { alpha, beta, pruned: pruned.length },
          callStack: [
            { name: "minimax", args: { depth, isMaximizing, alpha, beta } },
          ],
          reasoning: `${isMaximizing ? "Maximizer" : "Minimizer"} already has ${best}; opponent won't allow anything better here.`,
        };
        break;
      }
    }

    yield {
      type: "backtrack",
      data: {
        board: [...b],
        currentPlayer: player,
        alpha,
        beta,
        depth,
        bestMove,
        evaluationScores: { ...scores },
        pruned: [...pruned],
        phase: "backtrack",
        isMaximizing,
        path: [...path],
        score: best,
      },
      description: `${isMaximizing ? "MAX" : "MIN"} depth ${depth} → best = ${best}${bestMove !== undefined ? ` (cell ${bestMove})` : ""}`,
      codeLine: isMaximizing ? 9 : 15,
      variables: { best, bestMove, depth },
      callStack: [
        { name: "minimax", args: { depth, isMaximizing, alpha, beta } },
      ],
    };

    return best;
  }

  const currentBoard = [...board];
  const xCount = currentBoard.filter((c) => c === "X").length;
  const oCount = currentBoard.filter((c) => c === "O").length;
  let isXTurn = xCount <= oCount;

  while (true) {
    const terminalScore = evaluate(currentBoard);
    if (terminalScore !== null) {
      const { winner, line } = checkWinner(currentBoard);
      yield {
        type: "game-over",
        data: {
          board: [...currentBoard],
          currentPlayer: isXTurn ? "X" : "O",
          alpha: -Infinity,
          beta: Infinity,
          depth: 0,
          winner,
          winLine: line ?? undefined,
          phase: "game-over",
          path: [],
        },
        description: winner ? `${winner} wins!` : "Draw!",
        variables: { winner: winner ?? "draw" },
      };
      break;
    }

    if (!isXTurn) {
      yield* minimaxSearch(currentBoard, 0, true, -Infinity, Infinity, []);

      let bestScore = -Infinity;
      let bestIdx = -1;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] !== null) continue;
        currentBoard[i] = "O";
        const s = minimaxEval(currentBoard, 0, false, -Infinity, Infinity);
        currentBoard[i] = null;
        if (s > bestScore) {
          bestScore = s;
          bestIdx = i;
        }
      }

      currentBoard[bestIdx] = "O";
      yield {
        type: "ai-move",
        data: {
          board: [...currentBoard],
          currentPlayer: "O",
          bestMove: bestIdx,
          alpha: -Infinity,
          beta: Infinity,
          depth: 0,
          phase: "ai-move",
          path: [],
        },
        description: `AI (O) plays position ${bestIdx}`,
        variables: { move: bestIdx, score: bestScore },
      };
    } else {
      const empties = currentBoard
        .map((c, i) => (c === null ? i : -1))
        .filter((i) => i >= 0);
      const move = empties[0];
      currentBoard[move] = "X";
      yield {
        type: "player-move",
        data: {
          board: [...currentBoard],
          currentPlayer: "X",
          bestMove: move,
          alpha: -Infinity,
          beta: Infinity,
          depth: 0,
          phase: "player-move",
          path: [],
        },
        description: `Player (X) plays position ${move}`,
        variables: { move },
      };
    }

    isXTurn = !isXTurn;
  }
}

function minimaxEval(
  b: (string | null)[],
  depth: number,
  isMax: boolean,
  alpha: number,
  beta: number,
): number {
  const score = evaluate(b);
  if (score !== null) return score - (isMax ? depth : -depth);

  const player = isMax ? "O" : "X";
  let best = isMax ? -Infinity : Infinity;

  for (let i = 0; i < 9; i++) {
    if (b[i] !== null) continue;
    b[i] = player;
    const val = minimaxEval(b, depth + 1, !isMax, alpha, beta);
    b[i] = null;

    if (isMax) {
      best = Math.max(best, val);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, val);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}
