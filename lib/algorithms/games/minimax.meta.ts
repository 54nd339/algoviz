import type { AlgorithmMeta } from "@/types";

export const minimaxMeta: AlgorithmMeta = {
  id: "minimax",
  name: "Minimax (Tic-Tac-Toe)",
  category: "games",
  description:
    "Minimax with alpha-beta pruning explores the game tree to find the optimal move. The AI evaluates every possible future board state, pruning branches that cannot affect the final decision.",
  timeComplexity: { best: "O(b^(m/2))", average: "O(b^m)", worst: "O(b^m)" },
  spaceComplexity: "O(bm)",
  pseudocode: `function minimax(board, depth, isMax, α, β):
  if terminal(board): return score
  if isMax:
    best = -∞
    for each move:
      val = minimax(board, depth+1, false, α, β)
      best = max(best, val)
      α = max(α, best)
      if β ≤ α: break  // prune
    return best
  else:
    best = +∞
    for each move:
      val = minimax(board, depth+1, true, α, β)
      best = min(best, val)
      β = min(β, best)
      if β ≤ α: break  // prune
    return best`,
  presets: [
    {
      name: "Empty Board",
      generator: () => ({ board: Array(9).fill(null) }),
      expectedCase: "worst",
    },
    {
      name: "Mid-Game (X first)",
      generator: () => {
        const board: (string | null)[] = Array(9).fill(null);
        board[4] = "X";
        board[0] = "O";
        board[2] = "X";
        return { board };
      },
      expectedCase: "average",
    },
    {
      name: "Near End",
      generator: () => {
        const board: (string | null)[] = Array(9).fill(null);
        board[0] = "X";
        board[1] = "O";
        board[2] = "X";
        board[3] = "O";
        board[4] = "X";
        board[6] = "O";
        return { board };
      },
      expectedCase: "best",
    },
  ],
  misconceptions: [
    {
      myth: "Minimax always explores the entire game tree.",
      reality:
        "Alpha-beta pruning can eliminate up to half the tree (in the best case), reducing the effective branching factor from b to √b.",
    },
  ],
  relatedAlgorithms: ["n-queens", "sudoku-solver"],
};
