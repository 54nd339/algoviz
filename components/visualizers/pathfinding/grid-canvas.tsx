"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CellState, PathStep } from "@/lib/algorithms/pathfinding";
import type { EditorMode } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { getThemeColors } from "@/lib/utils/theme-colors";
import { useCanvasResize } from "@/hooks/use-canvas-resize";
import type { AlgorithmStep } from "@/types";

import {
  computeCellSize,
  computeGridDimensions,
  drawGrid,
  getCellFromMouse,
} from "./grid/grid-draw";

interface GridCanvasProps {
  step: AlgorithmStep<PathStep> | null;
  grid: CellState[][];
  startPos: [number, number];
  endPos: [number, number];
  weights: Record<string, number>;
  editorMode: EditorMode;
  isometric: boolean;
  onCellInteraction: (row: number, col: number, mode: EditorMode) => void;
  className?: string;
}

const CURSOR_CLASS: Record<EditorMode, string> = {
  select: "cursor-default",
  draw: "cursor-crosshair",
  erase: "cursor-cell",
  setStart: "cursor-grab",
  setEnd: "cursor-grab",
  setWeight: "cursor-pointer",
};

export function GridCanvas({
  step,
  grid,
  startPos,
  endPos,
  weights,
  editorMode,
  isometric,
  onCellInteraction,
  className,
}: GridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { width, height } = useCanvasResize(containerRef);

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const cellSize = computeCellSize(width, height, rows, cols);
  const { gridWidth, gridHeight } = computeGridDimensions(cellSize, rows, cols);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cellSize <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = gridWidth * dpr;
    canvas.height = gridHeight * dpr;
    canvas.style.width = `${gridWidth}px`;
    canvas.style.height = `${gridHeight}px`;
    ctx.scale(dpr, dpr);

    drawGrid({
      ctx,
      grid,
      rows,
      cols,
      cellSize,
      gridWidth,
      gridHeight,
      weights,
      startPos,
      endPos,
      step,
      isometric,
      theme: getThemeColors(),
    });
  }, [
    step,
    grid,
    startPos,
    endPos,
    weights,
    cellSize,
    gridWidth,
    gridHeight,
    rows,
    cols,
    isometric,
  ]);

  const getCellFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): [number, number] | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return getCellFromMouse(
        e.clientX,
        e.clientY,
        canvas,
        cellSize,
        rows,
        cols,
        gridWidth,
        gridHeight,
      );
    },
    [cellSize, gridWidth, gridHeight, rows, cols],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCellFromEvent(e);
      if (!cell) return;
      setIsDrawing(true);
      onCellInteraction(cell[0], cell[1], editorMode);
    },
    [getCellFromEvent, editorMode, onCellInteraction],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      if (editorMode !== "draw" && editorMode !== "erase") return;
      const cell = getCellFromEvent(e);
      if (!cell) return;
      onCellInteraction(cell[0], cell[1], editorMode);
    },
    [isDrawing, getCellFromEvent, editorMode, onCellInteraction],
  );

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden gap-2",
        className,
      )}
      data-tour="canvas"
    >
      <div className="relative flex flex-1 items-center justify-center">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Pathfinding grid"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn("max-h-full max-w-full rounded", CURSOR_CLASS[editorMode])}
        />

        {step?.data && (
          <div className="absolute bottom-2 left-2 rounded bg-zinc-900/80 px-2 py-1 backdrop-blur-sm">
            <div className="flex gap-3 font-mono text-[10px]">
              <span className="text-text-muted">
                Visited:{" "}
                <span className="text-cyan-400">{step.data.visitedCount}</span>
              </span>
              <span className="text-text-muted">
                Frontier:{" "}
                <span className="text-amber-400">{step.data.frontierSize}</span>
              </span>
              {step.data.pathLength > 0 && (
                <>
                  <span className="text-text-muted">
                    Path:{" "}
                    <span className="text-green-400">{step.data.pathLength}</span>
                  </span>
                  <span className="text-text-muted">
                    Cost:{" "}
                    <span className="text-green-400">{step.data.totalCost}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div
        className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-text-muted"
        aria-hidden
      >
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden /> Start
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden /> End
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-zinc-500" aria-hidden /> Wall
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden /> Frontier
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-cyan-400/50" aria-hidden /> Visited
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-300" aria-hidden /> Path
        </span>
      </div>
    </div>
  );
}
