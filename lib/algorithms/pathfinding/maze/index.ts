export { generateKruskalMaze } from "./kruskal-maze";
export { generatePrimMaze } from "./prim-maze";
export { generateRecursiveBacktracker } from "./recursive-backtracker";
export { generateRecursiveDivision } from "./recursive-division";

import type { CellState } from "../types";
import { generateKruskalMaze } from "./kruskal-maze";
import { generatePrimMaze } from "./prim-maze";
import { generateRecursiveBacktracker } from "./recursive-backtracker";
import { generateRecursiveDivision } from "./recursive-division";

export type MazeGeneratorFn = (rows: number, cols: number) => CellState[][];

export const MAZE_GENERATORS: Record<
  string,
  { name: string; generate: MazeGeneratorFn }
> = {
  "recursive-backtracker": {
    name: "Recursive Backtracker",
    generate: generateRecursiveBacktracker,
  },
  kruskal: {
    name: "Kruskal's Algorithm",
    generate: generateKruskalMaze,
  },
  prim: {
    name: "Prim's Algorithm",
    generate: generatePrimMaze,
  },
  "recursive-division": {
    name: "Recursive Division",
    generate: generateRecursiveDivision,
  },
};
