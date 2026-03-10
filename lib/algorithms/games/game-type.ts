import type { AlgorithmStep } from "@/types";

export function getGameType(step: AlgorithmStep): string | null {
  const data = step.data as Record<string, unknown>;

  if ("board" in data && "alpha" in data) return "minimax";
  if ("pegs" in data) return "hanoi";
  if ("grid" in data && "currentCell" in data && "conflicts" in data)
    return "sudoku";
  if ("grid" in data && "generation" in data) return "life";
  if ("board" in data && "path" in data) return "knight";
  if ("board" in data && "currentRow" in data && "n" in data) return "queens";
  if ("grid" in data && "emptyPos" in data) return "puzzle";

  return null;
}
