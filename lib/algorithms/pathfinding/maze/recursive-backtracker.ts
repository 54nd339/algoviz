import { CellState } from "../types";

export function generateRecursiveBacktracker(
  rows: number,
  cols: number,
): CellState[][] {
  const grid: CellState[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => CellState.Wall),
  );

  // Cells on odd coordinates are passages (enables proper wall thickness)
  const startR = 1;
  const startC = 1;
  grid[startR][startC] = CellState.Empty;

  const stack: [number, number][] = [[startR, startC]];
  const dirs: [number, number][] = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ];

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];
    const neighbors = shuffle(dirs)
      .map(([dr, dc]) => [cr + dr, cc + dc] as [number, number])
      .filter(
        ([nr, nc]) =>
          nr > 0 &&
          nr < rows - 1 &&
          nc > 0 &&
          nc < cols - 1 &&
          grid[nr][nc] === CellState.Wall,
      );

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const [nr, nc] = neighbors[0];
    grid[(cr + nr) / 2][(cc + nc) / 2] = CellState.Empty;
    grid[nr][nc] = CellState.Empty;
    stack.push([nr, nc]);
  }

  return grid;
}
