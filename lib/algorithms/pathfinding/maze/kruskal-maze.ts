import { CellState } from "../types";

class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx] < this.rank[ry]) {
      this.parent[rx] = ry;
    } else if (this.rank[rx] > this.rank[ry]) {
      this.parent[ry] = rx;
    } else {
      this.parent[ry] = rx;
      this.rank[rx]++;
    }
    return true;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateKruskalMaze(rows: number, cols: number): CellState[][] {
  const grid: CellState[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => CellState.Wall),
  );

  const cellRows = Math.floor((rows - 1) / 2);
  const cellCols = Math.floor((cols - 1) / 2);
  const totalCells = cellRows * cellCols;
  const uf = new UnionFind(totalCells);

  function cellId(r: number, c: number): number {
    return r * cellCols + c;
  }

  for (let r = 0; r < cellRows; r++) {
    for (let c = 0; c < cellCols; c++) {
      grid[r * 2 + 1][c * 2 + 1] = CellState.Empty;
    }
  }

  interface Edge {
    cr: number;
    cc: number;
    nr: number;
    nc: number;
    wallR: number;
    wallC: number;
  }
  const edges: Edge[] = [];

  for (let r = 0; r < cellRows; r++) {
    for (let c = 0; c < cellCols; c++) {
      if (r + 1 < cellRows) {
        edges.push({
          cr: r,
          cc: c,
          nr: r + 1,
          nc: c,
          wallR: r * 2 + 2,
          wallC: c * 2 + 1,
        });
      }
      if (c + 1 < cellCols) {
        edges.push({
          cr: r,
          cc: c,
          nr: r,
          nc: c + 1,
          wallR: r * 2 + 1,
          wallC: c * 2 + 2,
        });
      }
    }
  }

  const shuffled = shuffle(edges);

  for (const edge of shuffled) {
    const id1 = cellId(edge.cr, edge.cc);
    const id2 = cellId(edge.nr, edge.nc);
    if (uf.union(id1, id2)) {
      grid[edge.wallR][edge.wallC] = CellState.Empty;
    }
  }

  return grid;
}
