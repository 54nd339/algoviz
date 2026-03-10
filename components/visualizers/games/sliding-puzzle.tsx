"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import { GAMES_GENERATORS, type PuzzleStep } from "@/lib/algorithms/games";
import { findEmpty, isAdjacent } from "@/lib/algorithms/games/puzzle-utils";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import { swapTileWithEmpty } from "./sliding-puzzle-logic";

interface SlidingPuzzleProps {
  step: AlgorithmStep<PuzzleStep> | null;
  className?: string;
}

function getTileColor(val: number): string {
  if (val <= 4) return "bg-cyan-400/80 text-text-primary";
  if (val <= 8) return "bg-green-400/80 text-text-primary";
  if (val <= 12) return "bg-amber-400/80 text-text-primary";
  return "bg-violet-400/80 text-text-primary";
}

export function SlidingPuzzle({ step, className }: SlidingPuzzleProps) {
  const reducedMotion = useReducedMotion();
  const { algorithmMeta, configure, engineState } = useVisualizer();
  const data = step?.data;

  const isEditable =
    engineState === "idle" ||
    engineState === "ready" ||
    engineState === "materializing";

  const [editGrid, setEditGrid] = useState<(number | null)[][] | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [prevAlgoId, setPrevAlgoId] = useState<string | undefined>(undefined);

  if (data && isEditable && !initialized) {
    setInitialized(true);
    setEditGrid(data.grid.map((r) => [...r]));
    setMoveCount(0);
  }

  if (algorithmMeta?.id !== prevAlgoId) {
    setPrevAlgoId(algorithmMeta?.id);
    if (data && (engineState === "idle" || engineState === "ready")) {
      setEditGrid(data.grid.map((r) => [...r]));
      setMoveCount(0);
    }
  }

  const handleTileClick = useCallback(
    (r: number, c: number) => {
      if (!isEditable || !editGrid) return;
      const newGrid = swapTileWithEmpty(editGrid, r, c);
      if (!newGrid) return;

      setEditGrid(newGrid);
      setMoveCount((prev) => prev + 1);

      if (algorithmMeta) {
        const gen = GAMES_GENERATORS["fifteen-puzzle"];
        if (gen) {
          configure(
            algorithmMeta,
            gen as (
              input: unknown,
            ) => Generator<AlgorithmStep, void, undefined>,
            { grid: newGrid.map((row) => [...row]), maxSteps: 500 },
          );
        }
      }
    },
    [isEditable, editGrid, algorithmMeta, configure],
  );

  const handleTileKeyDown = useCallback(
    (e: React.KeyboardEvent, r: number, c: number) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      handleTileClick(r, c);
    },
    [handleTileClick],
  );

  const displayGrid = isEditable && editGrid ? editGrid : data?.grid;

  if (!displayGrid) {
    return (
      <EmptyCanvasState
        message="Select 15-Puzzle and press play"
        className={className}
      />
    );
  }

  const isPlaying = !isEditable;
  const emptyPos = isPlaying
    ? data?.emptyPos
    : editGrid
      ? findEmpty(editGrid)
      : undefined;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-zinc-900/80 p-2">
        {displayGrid.map((row, r) =>
          row.map((val, c) => {
            const isEmpty = val === null;
            const canMove =
              isEditable &&
              emptyPos &&
              isAdjacent(r, c, emptyPos[0], emptyPos[1]) &&
              !isEmpty;

            return (
              <motion.div
                key={`${r}-${c}`}
                layout
                role={canMove ? "button" : undefined}
                tabIndex={canMove ? 0 : undefined}
                aria-label={canMove ? `Move tile ${val} into empty space` : undefined}
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-md font-mono text-xl font-bold transition-colors",
                  isEmpty
                    ? "border border-dashed border-zinc-700 bg-zinc-950"
                    : cn("border border-white/10", getTileColor(val)),
                  canMove &&
                    "cursor-pointer ring-1 ring-cyan-400/30 hover:ring-cyan-400/60",
                )}
                onClick={() => canMove && handleTileClick(r, c)}
                onKeyDown={(e) => canMove && handleTileKeyDown(e, r, c)}
                whileHover={canMove ? { scale: 1.05 } : {}}
                whileTap={canMove ? { scale: 0.95 } : {}}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 25 }
                }
              >
                {!isEmpty && val}
              </motion.div>
            );
          }),
        )}
      </div>

      <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
        <span>
          Moves:{" "}
          <span className="text-text-primary">
            {isPlaying ? (data?.moveCount ?? 0) : moveCount}
          </span>
        </span>
        <span>
          Manhattan:{" "}
          <span
            className={cn(
              (data?.manhattan ?? 0) === 0
                ? "text-green-400"
                : "text-amber-400",
            )}
          >
            {data?.manhattan ?? "—"}
          </span>
        </span>
        {isPlaying && data?.moveDirection && (
          <span>
            Direction:{" "}
            <span className="text-cyan-400">{data.moveDirection}</span>
          </span>
        )}
        {isPlaying && data?.manhattan === 0 && (
          <span className="font-bold text-green-400">Solved!</span>
        )}
        {isEditable && (
          <span className="text-[10px] text-cyan-400">
            Click tiles to rearrange
          </span>
        )}
      </div>
    </div>
  );
}
