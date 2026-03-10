import { CellState } from "../types";

export function generateRecursiveDivision(
  rows: number,
  cols: number,
): CellState[][] {
  const grid: CellState[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => CellState.Empty),
  );

  for (let r = 0; r < rows; r++) {
    grid[r][0] = CellState.Wall;
    grid[r][cols - 1] = CellState.Wall;
  }
  for (let c = 0; c < cols; c++) {
    grid[0][c] = CellState.Wall;
    grid[rows - 1][c] = CellState.Wall;
  }

  function divide(rStart: number, rEnd: number, cStart: number, cEnd: number) {
    const height = rEnd - rStart;
    const width = cEnd - cStart;

    if (height < 3 || width < 3) return;

    const horizontal = width < height;

    if (horizontal) {
      const possibleRows: number[] = [];
      for (let r = rStart + 2; r < rEnd - 1; r += 2) {
        possibleRows.push(r);
      }
      if (possibleRows.length === 0) return;
      const wallRow =
        possibleRows[Math.floor(Math.random() * possibleRows.length)];

      const possiblePassages: number[] = [];
      for (let c = cStart + 1; c < cEnd; c += 2) {
        possiblePassages.push(c);
      }
      if (possiblePassages.length === 0) return;
      const passage =
        possiblePassages[Math.floor(Math.random() * possiblePassages.length)];

      for (let c = cStart; c <= cEnd; c++) {
        if (c !== passage) {
          grid[wallRow][c] = CellState.Wall;
        }
      }

      divide(rStart, wallRow, cStart, cEnd);
      divide(wallRow, rEnd, cStart, cEnd);
    } else {
      const possibleCols: number[] = [];
      for (let c = cStart + 2; c < cEnd - 1; c += 2) {
        possibleCols.push(c);
      }
      if (possibleCols.length === 0) return;
      const wallCol =
        possibleCols[Math.floor(Math.random() * possibleCols.length)];

      const possiblePassages: number[] = [];
      for (let r = rStart + 1; r < rEnd; r += 2) {
        possiblePassages.push(r);
      }
      if (possiblePassages.length === 0) return;
      const passage =
        possiblePassages[Math.floor(Math.random() * possiblePassages.length)];

      for (let r = rStart; r <= rEnd; r++) {
        if (r !== passage) {
          grid[r][wallCol] = CellState.Wall;
        }
      }

      divide(rStart, rEnd, cStart, wallCol);
      divide(rStart, rEnd, wallCol, cEnd);
    }
  }

  divide(0, rows - 1, 0, cols - 1);

  return grid;
}
