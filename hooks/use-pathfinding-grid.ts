"use client";

import { useCallback, useState } from "react";

import type { GridConfig, PathStep } from "@/lib/algorithms/pathfinding";
import {
  cellKey,
  CellState,
  createEmptyGrid,
  PATHFINDING_GENERATORS,
  TerrainType,
} from "@/lib/algorithms/pathfinding";
import { ensureOdd } from "@/lib/algorithms/pathfinding/grid-utils";
import { MAZE_GENERATORS } from "@/lib/algorithms/pathfinding/maze";
import type { EditorMode } from "@/lib/engine";
import type { AlgorithmMeta, AlgorithmStep } from "@/types";

import "@/lib/algorithms/pathfinding";

const DEFAULT_SIZE = 25;

export function usePathfindingGrid(
  configure: (
    meta: AlgorithmMeta,
    gen: (input: unknown) => Generator<AlgorithmStep<PathStep>, void, undefined>,
    input: unknown,
  ) => void,
  reset: () => void,
  algorithmMeta: AlgorithmMeta | null,
) {
  const [gridSize, setGridSize] = useState(DEFAULT_SIZE);
  const [grid, setGrid] = useState<CellState[][]>(() =>
    createEmptyGrid(DEFAULT_SIZE, DEFAULT_SIZE),
  );
  const [startPos, setStartPos] = useState<[number, number]>([1, 1]);
  const [endPos, setEndPos] = useState<[number, number]>([
    DEFAULT_SIZE - 2,
    DEFAULT_SIZE - 2,
  ]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [editorMode, setEditorMode] = useState<EditorMode>("draw");
  const [allowDiagonal, setAllowDiagonal] = useState(false);
  const [heuristic, setHeuristic] = useState<"manhattan" | "euclidean">(
    "manhattan",
  );
  const [isometric, setIsometric] = useState(false);

  const handleCellInteraction = useCallback(
    (row: number, col: number, mode: EditorMode) => {
      if (
        (mode === "draw" || mode === "erase") &&
        ((row === startPos[0] && col === startPos[1]) ||
          (row === endPos[0] && col === endPos[1]))
      ) {
        return;
      }

      setGrid((prev) => {
        const next = prev.map((r) => [...r]);
        switch (mode) {
          case "draw":
            next[row][col] = CellState.Wall;
            break;
          case "erase":
            next[row][col] = CellState.Empty;
            break;
          case "setStart":
            setStartPos([row, col]);
            break;
          case "setEnd":
            setEndPos([row, col]);
            break;
          case "setWeight": {
            const key = cellKey(row, col);
            setWeights((prev) => {
              const nextWeights = { ...prev };
              const current = nextWeights[key] ?? 0;
              if (current === 0) {
                nextWeights[key] = TerrainType.Grass;
              } else if (current === TerrainType.Grass) {
                nextWeights[key] = TerrainType.Mud;
              } else if (current === TerrainType.Mud) {
                nextWeights[key] = TerrainType.Water;
              } else {
                delete nextWeights[key];
              }
              return nextWeights;
            });
            break;
          }
        }
        return next;
      });
    },
    [startPos, endPos],
  );

  const handleGridSizeChange = useCallback(
    (size: number) => {
      setGridSize(size);
      const newGrid = createEmptyGrid(size, size);
      setGrid(newGrid);
      const newStart: [number, number] = [1, 1];
      const newEnd: [number, number] = [size - 2, size - 2];
      setStartPos(newStart);
      setEndPos(newEnd);
      setWeights({});
      reset();
    },
    [reset],
  );

  const handleGenerateMaze = useCallback(
    (generatorId: string) => {
      const gen = MAZE_GENERATORS[generatorId];
      if (!gen) return;

      const mazeSize = ensureOdd(gridSize);
      const mazeGrid = gen.generate(mazeSize, mazeSize);

      const newStart: [number, number] = [1, 1];
      const newEnd: [number, number] = [mazeSize - 2, mazeSize - 2];
      mazeGrid[newStart[0]][newStart[1]] = CellState.Empty;
      mazeGrid[newEnd[0]][newEnd[1]] = CellState.Empty;

      setGridSize(mazeSize);
      setGrid(mazeGrid);
      setStartPos(newStart);
      setEndPos(newEnd);
      setWeights({});
      reset();
    },
    [gridSize, reset],
  );

  const handleClearWalls = useCallback(() => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => (cell === CellState.Wall ? CellState.Empty : cell)),
      ),
    );
    setWeights({});
    reset();
  }, [reset]);

  const handleClearPath = useCallback(() => {
    reset();
  }, [reset]);

  const handleResetGrid = useCallback(() => {
    setGrid(createEmptyGrid(gridSize, gridSize));
    setStartPos([1, 1]);
    setEndPos([gridSize - 2, gridSize - 2]);
    setWeights({});
    reset();
  }, [gridSize, reset]);

  const handleAllowDiagonalChange = useCallback((val: boolean) => {
    setAllowDiagonal(val);
  }, []);

  const handleHeuristicChange = useCallback(
    (val: "manhattan" | "euclidean") => {
      setHeuristic(val);
    },
    [],
  );

  const handleBeforePlay = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = (
      PATHFINDING_GENERATORS as Record<
        string,
        (
          input: GridConfig,
        ) => Generator<AlgorithmStep<PathStep>, void, undefined>
      >
    )[algorithmMeta.id];
    if (!gen) return;
    const input: GridConfig = {
      rows: grid.length,
      cols: grid[0]?.length ?? 0,
      start: startPos,
      end: endPos,
      allowDiagonal,
      weights,
      heuristic,
      grid,
    };
    configure(
      algorithmMeta,
      gen as (
        input: unknown,
      ) => Generator<AlgorithmStep<PathStep>, void, undefined>,
      input,
    );
  }, [
    algorithmMeta,
    grid,
    startPos,
    endPos,
    allowDiagonal,
    weights,
    heuristic,
    configure,
  ]);

  return {
    gridSize,
    grid,
    startPos,
    endPos,
    weights,
    editorMode,
    setEditorMode,
    allowDiagonal,
    heuristic,
    isometric,
    setIsometric,
    handleCellInteraction,
    handleGridSizeChange,
    handleGenerateMaze,
    handleClearWalls,
    handleClearPath,
    handleResetGrid,
    handleAllowDiagonalChange,
    handleHeuristicChange,
    handleBeforePlay,
  };
}
