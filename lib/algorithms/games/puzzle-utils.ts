/**
 * Finds the position of the empty tile (null) in a sliding puzzle grid.
 * Returns [row, col] or [3, 3] if not found (fallback for 4x4 grid).
 */
export function findEmpty(grid: (number | null)[][]): [number, number] {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === null) return [r, c];
    }
  }
  return [3, 3];
}

/**
 * Checks if two grid positions (r1,c1) and (r2,c2) are adjacent (orthogonally).
 */
export function isAdjacent(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): boolean {
  return (
    (Math.abs(r1 - r2) === 1 && c1 === c2) ||
    (Math.abs(c1 - c2) === 1 && r1 === r2)
  );
}
