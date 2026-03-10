export enum CellState {
  Empty = 0,
  Wall = 1,
  Start = 2,
  End = 3,
  Weighted = 4,
}

export enum TerrainType {
  None = 0,
  Grass = 2,
  Mud = 5,
  Water = 10,
}

export interface GridConfig {
  rows: number;
  cols: number;
  start: [number, number];
  end: [number, number];
  allowDiagonal: boolean;
  weights: Record<string, number>;
  heuristic?: "manhattan" | "euclidean";
  /** When provided, algorithm runs on this grid (with walls). Otherwise uses an empty grid. */
  grid?: CellState[][];
}

export interface PathStep {
  grid: CellState[][];
  visited: string[];
  frontier: string[];
  current?: [number, number];
  path: [number, number][];
  distances: Record<string, number>;
  parent: Record<string, string>;
  visitedCount: number;
  frontierSize: number;
  pathLength: number;
  totalCost: number;
  phase: "searching" | "path-found" | "no-path" | "tracing";
  // Bidirectional BFS specific
  visitedForward?: string[];
  visitedBackward?: string[];
  frontierForward?: string[];
  frontierBackward?: string[];
  meetingPoint?: [number, number];
}

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function parseKey(key: string): [number, number] {
  const [r, c] = key.split(",").map(Number);
  return [r, c];
}

export function getNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number,
  allowDiagonal: boolean,
): [number, number][] {
  const dirs: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  if (allowDiagonal) {
    dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }
  return dirs
    .map(([dr, dc]) => [row + dr, col + dc] as [number, number])
    .filter(([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols);
}

export function getCellCost(
  row: number,
  col: number,
  weights: Record<string, number>,
): number {
  return weights[cellKey(row, col)] ?? 1;
}

export function reconstructPath(
  parent: Record<string, string>,
  start: string,
  end: string,
): [number, number][] {
  const path: [number, number][] = [];
  let current = end;
  while (current && current !== start) {
    path.unshift(parseKey(current));
    current = parent[current];
  }
  if (current === start) {
    path.unshift(parseKey(start));
  }
  return path;
}

export function createEmptyGrid(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => CellState.Empty),
  );
}

/** Build the grid the algorithm runs on: use input.grid (with walls) if provided, else empty. Always sets Start/End. */
export function getWorkingGrid(input: GridConfig): CellState[][] {
  const { rows, cols, start, end, grid: inputGrid } = input;
  let grid: CellState[][];
  if (inputGrid && inputGrid.length === rows && inputGrid[0]?.length === cols) {
    grid = inputGrid.map((row) => [...row]);
  } else {
    grid = createEmptyGrid(rows, cols);
  }
  grid[start[0]][start[1]] = CellState.Start;
  grid[end[0]][end[1]] = CellState.End;
  return grid;
}
