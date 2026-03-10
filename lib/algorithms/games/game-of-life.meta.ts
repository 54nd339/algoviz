import type { AlgorithmMeta } from "@/types";

const GLIDER: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 0],
  [2, 1],
  [2, 2],
];
const BLINKER: [number, number][] = [
  [1, 0],
  [1, 1],
  [1, 2],
];
const PULSAR = (() => {
  const cells: [number, number][] = [];
  const offsets = [
    [2, 1],
    [3, 1],
    [4, 1],
    [2, 6],
    [3, 6],
    [4, 6],
    [1, 2],
    [1, 3],
    [1, 4],
    [6, 2],
    [6, 3],
    [6, 4],
  ];
  for (const [r, c] of offsets) {
    cells.push([r, c], [r, 12 - c], [12 - r, c], [12 - r, 12 - c]);
  }
  return [...new Set(cells.map((c) => c.join(",")))].map(
    (s) => s.split(",").map(Number) as [number, number],
  );
})();
const GOSPER_GUN: [number, number][] = [
  [5, 1],
  [5, 2],
  [6, 1],
  [6, 2],
  [5, 11],
  [6, 11],
  [7, 11],
  [4, 12],
  [8, 12],
  [3, 13],
  [9, 13],
  [3, 14],
  [9, 14],
  [6, 15],
  [4, 16],
  [8, 16],
  [5, 17],
  [6, 17],
  [7, 17],
  [6, 18],
  [3, 21],
  [4, 21],
  [5, 21],
  [3, 22],
  [4, 22],
  [5, 22],
  [2, 23],
  [6, 23],
  [1, 25],
  [2, 25],
  [6, 25],
  [7, 25],
  [3, 35],
  [4, 35],
  [3, 36],
  [4, 36],
];
const R_PENTOMINO: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [2, 1],
];
const BEACON: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [2, 3],
  [3, 2],
  [3, 3],
];
const TOAD: [number, number][] = [
  [1, 0],
  [1, 1],
  [1, 2],
  [0, 1],
  [0, 2],
  [0, 3],
];
const LWSS: [number, number][] = [
  [0, 1],
  [0, 3],
  [1, 0],
  [2, 0],
  [2, 3],
  [3, 0],
  [3, 1],
  [3, 2],
];
const DIEHARD: [number, number][] = [
  [0, 6],
  [1, 0],
  [1, 1],
  [2, 1],
  [2, 5],
  [2, 6],
  [2, 7],
];
const ACORN: [number, number][] = [
  [0, 1],
  [1, 3],
  [2, 0],
  [2, 1],
  [2, 4],
  [2, 5],
  [2, 6],
];

function makeGrid(
  rows: number,
  cols: number,
  cells: [number, number][],
  offsetR = 0,
  offsetC = 0,
): boolean[][] {
  const grid: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );
  for (const [r, c] of cells) {
    const gr = r + offsetR;
    const gc = c + offsetC;
    if (gr >= 0 && gr < rows && gc >= 0 && gc < cols) {
      grid[gr][gc] = true;
    }
  }
  return grid;
}

function randomSoup(rows: number, cols: number, density = 0.3): boolean[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() < density),
  );
}

export const gameOfLifeMeta: AlgorithmMeta = {
  id: "game-of-life",
  name: "Game of Life",
  category: "games",
  description:
    "Conway's Game of Life is a cellular automaton where cells live or die based on their neighbors: a live cell with 2-3 neighbors survives, a dead cell with exactly 3 neighbors is born, all others die.",
  timeComplexity: { best: "O(rc)", average: "O(rc)", worst: "O(rc)" },
  spaceComplexity: "O(rc)",
  pseudocode: `for each generation:
  for each cell (r, c):
    n = countLiveNeighbors(r, c)
    if cell is alive:
      survive = (n == 2 or n == 3)
    else:
      born = (n == 3)
  apply births and deaths`,
  presets: [
    {
      name: "Glider",
      generator: () => ({
        grid: makeGrid(30, 30, GLIDER, 2, 2),
        generations: 60,
      }),
      expectedCase: "average",
    },
    {
      name: "Blinker",
      generator: () => ({
        grid: makeGrid(10, 10, BLINKER, 4, 4),
        generations: 20,
      }),
      expectedCase: "best",
    },
    {
      name: "Pulsar",
      generator: () => ({
        grid: makeGrid(20, 20, PULSAR, 3, 3),
        generations: 30,
      }),
      expectedCase: "average",
    },
    {
      name: "Gosper Glider Gun",
      generator: () => ({
        grid: makeGrid(40, 50, GOSPER_GUN, 2, 2),
        generations: 100,
      }),
      expectedCase: "worst",
    },
    {
      name: "R-pentomino",
      generator: () => ({
        grid: makeGrid(40, 40, R_PENTOMINO, 18, 18),
        generations: 80,
      }),
      expectedCase: "average",
    },
    {
      name: "Random Soup",
      generator: () => ({ grid: randomSoup(30, 30, 0.3), generations: 60 }),
      expectedCase: "random",
    },
    {
      name: "Beacon",
      generator: () => ({
        grid: makeGrid(12, 12, BEACON, 2, 2),
        generations: 30,
      }),
      expectedCase: "best",
    },
    {
      name: "Toad",
      generator: () => ({
        grid: makeGrid(12, 12, TOAD, 4, 2),
        generations: 20,
      }),
      expectedCase: "best",
    },
    {
      name: "Lightweight Spaceship (LWSS)",
      generator: () => ({
        grid: makeGrid(30, 30, LWSS, 10, 5),
        generations: 60,
      }),
      expectedCase: "average",
    },
    {
      name: "Diehard",
      generator: () => ({
        grid: makeGrid(40, 40, DIEHARD, 18, 15),
        generations: 140,
      }),
      expectedCase: "average",
    },
    {
      name: "Acorn",
      generator: () => ({
        grid: makeGrid(60, 60, ACORN, 25, 25),
        generations: 200,
      }),
      expectedCase: "worst",
    },
    {
      name: "Custom (empty)",
      generator: () => ({ grid: makeGrid(30, 30, []), generations: 60 }),
      expectedCase: "best",
    },
  ],
  misconceptions: [
    {
      myth: "The Game of Life is just random — patterns can't be predicted.",
      reality:
        "The rules are completely deterministic. Given any starting state, the future is fully determined. The apparent randomness comes from emergent complexity.",
    },
  ],
  relatedAlgorithms: ["knight-tour"],
};
