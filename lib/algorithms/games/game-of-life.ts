import type { AlgorithmGenerator } from "@/types";

import { registerAlgorithm } from "../registry";
import { gameOfLifeMeta } from "./game-of-life.meta";
import type { LifeStep } from "./types";

export { gameOfLifeMeta };
registerAlgorithm(gameOfLifeMeta);

function countNeighbors(grid: boolean[][], r: number, c: number): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc]) {
        count++;
      }
    }
  }
  return count;
}

export function* gameOfLife(input: {
  grid: boolean[][];
  generations?: number;
}): AlgorithmGenerator<LifeStep> {
  let grid = input.grid.map((row) => [...row]);
  const maxGen = input.generations ?? 50;
  const rows = grid.length;
  const cols = grid[0].length;

  const population = grid.flat().filter(Boolean).length;

  yield {
    type: "init",
    data: {
      grid: grid.map((r) => [...r]),
      generation: 0,
      population,
      births: [],
      deaths: [],
    },
    description: `Generation 0 — ${population} live cells on a ${rows}x${cols} grid`,
    codeLine: 1,
    variables: { rows, cols, population, generation: 0 },
  };

  for (let gen = 1; gen <= maxGen; gen++) {
    const next: boolean[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(false),
    );
    const births: [number, number][] = [];
    const deaths: [number, number][] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const n = countNeighbors(grid, r, c);
        if (grid[r][c]) {
          if (n === 2 || n === 3) {
            next[r][c] = true;
          } else {
            deaths.push([r, c]);
          }
        } else {
          if (n === 3) {
            next[r][c] = true;
            births.push([r, c]);
          }
        }
      }
    }

    grid = next;
    const pop = grid.flat().filter(Boolean).length;

    yield {
      type: "generation",
      data: {
        grid: grid.map((r) => [...r]),
        generation: gen,
        population: pop,
        births,
        deaths,
      },
      description: `Generation ${gen}: ${births.length} births, ${deaths.length} deaths — ${pop} alive`,
      codeLine: 2,
      variables: {
        generation: gen,
        population: pop,
        births: births.length,
        deaths: deaths.length,
      },
    };

    if (pop === 0) break;
  }

  const finalPop = grid.flat().filter(Boolean).length;
  yield {
    type: "done",
    data: {
      grid: grid.map((r) => [...r]),
      generation: maxGen,
      population: finalPop,
      births: [],
      deaths: [],
    },
    description: `Simulation complete after ${maxGen} generations — ${finalPop} cells alive`,
    variables: { finalPopulation: finalPop },
  };
}
