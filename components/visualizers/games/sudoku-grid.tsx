"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import { GAMES_GENERATORS,type SudokuStep } from "@/lib/algorithms/games";
import {
  buildSudokuInput,
  cellKey,
  createEmptySudokuGrid,
} from "@/lib/algorithms/games/sudoku-utils";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

interface SudokuGridProps {
  step: AlgorithmStep<SudokuStep> | null;
  className?: string;
}

export function SudokuGrid({ step, className }: SudokuGridProps) {
  const reducedMotion = useReducedMotion();
  const { algorithmMeta, configure, engineState } = useVisualizer();
  const data = step?.data;

  const [editGrid, setEditGrid] = useState<(number | null)[][] | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null,
  );
  const [givenCells, setGivenCells] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  const isEditable =
    engineState === "idle" ||
    engineState === "ready" ||
    engineState === "materializing";

  const [prevAlgoId, setPrevAlgoId] = useState<string | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  function syncGridFromData() {
    if (!data) return;
    setEditGrid(data.grid.map((r) => [...r]));
    const given = new Set<string>();
    data.grid.forEach((row, r) =>
      row.forEach((val, c) => {
        if (val !== null) given.add(cellKey(r, c));
      }),
    );
    setGivenCells(given);
  }

  if (data && !initialized) {
    setInitialized(true);
    syncGridFromData();
  }

  if (algorithmMeta?.id !== prevAlgoId) {
    setPrevAlgoId(algorithmMeta?.id);
    if (data && (engineState === "idle" || engineState === "ready")) {
      syncGridFromData();
    }
  }

  const applyGrid = useCallback(
    (grid: (number | null)[][]) => {
      if (!algorithmMeta) return;
      const gen = GAMES_GENERATORS["sudoku-solver"];
      if (!gen) return;
      configure(
        algorithmMeta,
        gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
        buildSudokuInput(grid),
      );
    },
    [algorithmMeta, configure],
  );

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (!isEditable) return;
      setSelectedCell([r, c]);
    },
    [isEditable],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isEditable || !selectedCell || !editGrid) return;
      const [r, c] = selectedCell;

      if (e.key >= "1" && e.key <= "9") {
        const num = Number(e.key);
        const newGrid = editGrid.map((row) => [...row]);
        newGrid[r][c] = num;
        setEditGrid(newGrid);
        setGivenCells((prev) => new Set([...prev, cellKey(r, c)]));
        applyGrid(newGrid);
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        const newGrid = editGrid.map((row) => [...row]);
        newGrid[r][c] = null;
        setEditGrid(newGrid);
        setGivenCells((prev) => {
          const s = new Set(prev);
          s.delete(cellKey(r, c));
          return s;
        });
        applyGrid(newGrid);
      } else if (e.key === "ArrowUp" && r > 0) {
        setSelectedCell([r - 1, c]);
      } else if (e.key === "ArrowDown" && r < 8) {
        setSelectedCell([r + 1, c]);
      } else if (e.key === "ArrowLeft" && c > 0) {
        setSelectedCell([r, c - 1]);
      } else if (e.key === "ArrowRight" && c < 8) {
        setSelectedCell([r, c + 1]);
      }
    },
    [isEditable, selectedCell, editGrid, applyGrid],
  );

  const clearBoard = useCallback(() => {
    const empty = createEmptySudokuGrid();
    setEditGrid(empty);
    setGivenCells(new Set());
    applyGrid(empty);
  }, [applyGrid]);

  const displayGrid = isEditable && editGrid ? editGrid : data?.grid;

  if (!displayGrid) {
    return (
      <EmptyCanvasState
        message="Select Sudoku Solver and press play"
        className={className}
      />
    );
  }

  const isPlaying = !isEditable;
  const conflicts = data?.conflicts ?? [];
  const placed = data?.placed ?? [];
  const currentCell = data?.currentCell ?? [0, 0];
  const trying = data?.trying;
  const backtracking = data?.backtracking ?? false;
  const conflictSet = new Set(conflicts.map(([r, c]) => cellKey(r, c)));
  const placedSet = new Set(placed.map(([r, c]) => cellKey(r, c)));
  const currentKey = isPlaying ? cellKey(currentCell[0], currentCell[1]) : "";

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {isEditable && (
        <div className="flex items-center gap-2">
          <button
            onClick={clearBoard}
            className="h-7 rounded border border-border bg-bg-surface px-3 font-mono text-[11px] text-text-muted transition-colors hover:bg-bg-elevated"
          >
            Clear Board
          </button>
          <span className="font-mono text-[10px] text-text-muted">
            {givenCells.size} clues
          </span>
        </div>
      )}

      <div
        ref={gridRef}
        className="grid grid-cols-9 rounded-lg border-2 border-zinc-500 bg-zinc-900/80 focus:outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {displayGrid.map((row, r) =>
          row.map((val, c) => {
            const key = cellKey(r, c);
            const isSelected =
              isEditable && selectedCell?.[0] === r && selectedCell?.[1] === c;
            const isCurrent =
              isPlaying &&
              key === currentKey &&
              step?.type !== "init" &&
              step?.type !== "done";
            const isConflict = isPlaying && conflictSet.has(key);
            const isPlacedCell = isPlaying && placedSet.has(key);
            const isGiven = isEditable && givenCells.has(key);

            const borderR =
              (r + 1) % 3 === 0 && r < 8
                ? "border-b-2 border-b-zinc-500"
                : "border-b border-b-zinc-700";
            const borderC =
              (c + 1) % 3 === 0 && c < 8
                ? "border-r-2 border-r-zinc-500"
                : "border-r border-r-zinc-700";

            return (
              <motion.div
                key={`${r}-${c}`}
                className={cn(
                  "flex h-10 w-10 items-center justify-center font-mono text-sm transition-colors",
                  borderR,
                  borderC,
                  isEditable && "cursor-pointer hover:bg-zinc-800/60",
                  isSelected &&
                    "bg-cyan-400/20 ring-1 ring-cyan-400/40 ring-inset",
                  isCurrent && backtracking && "bg-red-400/20",
                  isCurrent && !backtracking && trying && "bg-cyan-400/20",
                  isCurrent && !backtracking && !trying && "bg-cyan-400/10",
                  isConflict && "bg-red-400/15",
                  !isSelected && !isCurrent && !isConflict && "bg-transparent",
                )}
                onClick={() => handleCellClick(r, c)}
                animate={
                  isConflict
                    ? { scale: [1, 1.05, 1] }
                    : isCurrent
                      ? { scale: [1, 1.02, 1] }
                      : {}
                }
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                <span
                  className={cn(
                    "font-mono",
                    isEditable && isGiven && "font-bold text-text-primary",
                    isEditable && !isGiven && val !== null && "text-cyan-400",
                    isEditable && val === null && "text-transparent",
                    isPlaying &&
                      isCurrent &&
                      trying &&
                      "font-bold text-cyan-400",
                    isPlaying && isConflict && "font-bold text-red-400",
                    isPlaying &&
                      isPlacedCell &&
                      !isCurrent &&
                      !isConflict &&
                      "text-green-400",
                    isPlaying &&
                      !isCurrent &&
                      !isConflict &&
                      !isPlacedCell &&
                      val !== null &&
                      "font-bold text-text-primary",
                    isPlaying &&
                      val === null &&
                      !isCurrent &&
                      "text-transparent",
                  )}
                >
                  {isPlaying && isCurrent && trying ? trying : (val ?? ".")}
                </span>
              </motion.div>
            );
          }),
        )}
      </div>

      <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
        {isPlaying &&
          step?.type !== "init" &&
          step?.type !== "done" &&
          step?.type !== "no-solution" && (
            <>
              <span>
                Cell:{" "}
                <span className="text-text-primary">
                  ({currentCell[0]},{currentCell[1]})
                </span>
              </span>
              {trying && (
                <span>
                  Trying: <span className="text-cyan-400">{trying}</span>
                </span>
              )}
              {conflicts.length > 0 && (
                <span className="text-red-400">
                  {conflicts.length} conflicts
                </span>
              )}
              {backtracking && (
                <span className="text-amber-400">Backtracking</span>
              )}
            </>
          )}
        <span>
          Filled:{" "}
          <span className="text-text-primary">
            {placed.length || givenCells.size}
          </span>
          /81
        </span>
      </div>
    </div>
  );
}
