"use client";

import { useCallback, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui";
import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { LifeStep } from "@/lib/algorithms/games";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

import { drawLifeGrid, getCellFromMouse } from "./life/life-draw";
import { useLifeGrid } from "./life/use-life-grid";

interface LifeGridProps {
  step: AlgorithmStep<LifeStep> | null;
  className?: string;
}

export function LifeGrid({ step, className }: LifeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    activeGrid,
    data,
    drawGrid,
    rows,
    cols,
    isEditable,
    handleCellPointerDown,
    handleCellPointerMove,
    handleCellPointerUp,
    clearGrid,
  } = useLifeGrid(step);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeGrid) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawLifeGrid(ctx, {
      grid: activeGrid,
      births: data?.births ?? [],
      deaths: data?.deaths ?? [],
      isEditable,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });
  }, [activeGrid, data?.births, data?.deaths, isEditable]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawCanvas();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawCanvas]);

  const getCellFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || rows === 0 || cols === 0) return null;
      return getCellFromMouse(e.clientX, e.clientY, canvas, rows, cols);
    },
    [rows, cols],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCellFromEvent(e);
      if (!cell) return;
      handleCellPointerDown(cell[0], cell[1]);
    },
    [getCellFromEvent, handleCellPointerDown],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCellFromEvent(e);
      if (!cell) return;
      handleCellPointerMove(cell[0], cell[1]);
    },
    [getCellFromEvent, handleCellPointerMove],
  );

  const handleMouseUp = useCallback(() => {
    handleCellPointerUp();
  }, [handleCellPointerUp]);

  if (!activeGrid) {
    return (
      <EmptyCanvasState
        message="Select Game of Life and press play"
        className={className}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full w-full flex-col items-center gap-3",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Game of Life grid, Generation ${data?.generation ?? 0}, Population ${
          isEditable && drawGrid
            ? drawGrid.flat().filter(Boolean).length
            : data?.population ?? 0
        }, ${rows}×${cols} cells`}
        className={cn(
          "w-full flex-1 rounded-lg border border-border bg-zinc-950 [image-rendering:pixelated]",
          isEditable && "cursor-crosshair",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Color legend */}
      <div
        className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-text-muted"
        aria-hidden
      >
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-green-400" aria-hidden />
          Alive
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-cyan-400" aria-hidden />
          Birth
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-red-400/40" aria-hidden />
          Death
        </span>
      </div>

      <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
        <span>
          Generation:{" "}
          <span className="text-text-primary">{data?.generation ?? 0}</span>
        </span>
        <span>
          Population:{" "}
          <span className="text-green-400">
            {isEditable && drawGrid
              ? drawGrid.flat().filter(Boolean).length
              : (data?.population ?? 0)}
          </span>
        </span>
        <span>
          Grid:{" "}
          <span className="text-text-primary">
            {rows}×{cols}
          </span>
        </span>
        {!isEditable && data && data.births.length > 0 && (
          <span className="text-cyan-400">+{data.births.length} births</span>
        )}
        {!isEditable && data && data.deaths.length > 0 && (
          <span className="text-red-400">-{data.deaths.length} deaths</span>
        )}
        {isEditable && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearGrid}
            className="h-6 gap-1 px-2 text-[10px]"
          >
            <Trash2 size={10} /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
