"use client";

interface GameHintsProps {
  algId: string | undefined;
}

/** Renders contextual hints for Life, Sudoku, and 15-Puzzle. */
export function GameHints({ algId }: GameHintsProps) {
  if (algId === "game-of-life") {
    return (
      <p className="pl-1 font-mono text-[10px] text-text-muted">
        Click/drag on the grid to draw cells, then press play. Set Gens high
        (e.g. 2000) to run continuously — pause anytime.
      </p>
    );
  }
  if (algId === "sudoku-solver") {
    return (
      <p className="pl-1 font-mono text-[10px] text-text-muted">
        Click a cell and type 1-9 to edit, Backspace to clear. Then press play
        to solve.
      </p>
    );
  }
  if (algId === "fifteen-puzzle") {
    return (
      <p className="pl-1 font-mono text-[10px] text-text-muted">
        Click a tile next to the empty space to swap it. Then press play to
        solve.
      </p>
    );
  }
  return null;
}
