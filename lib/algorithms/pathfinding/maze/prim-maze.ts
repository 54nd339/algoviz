import { CellState } from "../types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generatePrimMaze(rows: number, cols: number): CellState[][] {
  const grid: CellState[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => CellState.Wall),
  );

  const startR = 1;
  const startC = 1;
  grid[startR][startC] = CellState.Empty;

  interface Wall {
    cellR: number;
    cellC: number;
    wallR: number;
    wallC: number;
  }

  const dirs: [number, number][] = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ];

  function getWalls(r: number, c: number): Wall[] {
    return dirs
      .map(([dr, dc]) => ({
        cellR: r + dr,
        cellC: c + dc,
        wallR: r + dr / 2,
        wallC: c + dc / 2,
      }))
      .filter(
        (w) =>
          w.cellR > 0 &&
          w.cellR < rows - 1 &&
          w.cellC > 0 &&
          w.cellC < cols - 1,
      );
  }

  let frontier = shuffle(getWalls(startR, startC));

  while (frontier.length > 0) {
    const idx = Math.floor(Math.random() * frontier.length);
    const wall = frontier[idx];
    frontier.splice(idx, 1);

    if (grid[wall.cellR][wall.cellC] === CellState.Wall) {
      grid[wall.wallR][wall.wallC] = CellState.Empty;
      grid[wall.cellR][wall.cellC] = CellState.Empty;
      frontier = frontier.concat(
        getWalls(wall.cellR, wall.cellC).filter(
          (w) => grid[w.cellR][w.cellC] === CellState.Wall,
        ),
      );
    }
  }

  return grid;
}
