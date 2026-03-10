/**
 * Creates an empty 9x9 Sudoku grid.
 */
export function createEmptySudokuGrid(): (number | null)[][] {
  return Array.from({ length: 9 }, () =>
    Array(9).fill(null) as (number | null)[],
  );
}

/**
 * Builds the input object for the Sudoku solver algorithm.
 */
export function buildSudokuInput(
  grid: (number | null)[][],
): { grid: (number | null)[][] } {
  return { grid: grid.map((r) => [...r]) };
}

/**
 * Returns a unique key for a grid cell position.
 */
export function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}
