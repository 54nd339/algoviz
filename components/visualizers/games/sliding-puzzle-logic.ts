/**
 * Pure utilities for sliding puzzle grid manipulation.
 * No React, no hooks.
 */

import { findEmpty, isAdjacent } from "@/lib/algorithms/games/puzzle-utils";

/**
 * Swaps the tile at (r, c) with the empty cell.
 * Returns a new grid with the swap applied, or null if the swap is invalid
 * (tile not adjacent to empty).
 */
export function swapTileWithEmpty(
  grid: (number | null)[][],
  r: number,
  c: number,
): (number | null)[][] | null {
  const [er, ec] = findEmpty(grid);
  if (!isAdjacent(r, c, er, ec)) return null;

  const newGrid = grid.map((row) => [...row]);
  newGrid[er][ec] = newGrid[r][c];
  newGrid[r][c] = null;
  return newGrid;
}
