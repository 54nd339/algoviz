"use client";

import { useRef } from "react";

import type { OptimizationStep } from "@/lib/algorithms/optimization";
import { cn } from "@/lib/utils";
import { useCanvasResize } from "@/hooks/use-canvas-resize";

import { ContourPlot1D } from "./contour/contour-plot-1d";
import { ContourPlot2D } from "./contour/contour-plot-2d";
import { MARGIN } from "./contour/contour-plot-shared";

interface ContourPlotProps {
  step: OptimizationStep | null;
  is2D: boolean;
  /** When provided, the position marker is draggable; callback receives new start (x for 1D, x,y for 2D). */
  onStartChange?: (x: number, y?: number) => void;
  className?: string;
}

export function ContourPlot({
  step,
  is2D,
  onStartChange,
  className,
}: ContourPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useCanvasResize(containerRef);
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const innerProps = {
    step,
    width,
    height,
    innerWidth,
    innerHeight,
    onStartChange,
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full min-h-[300px] w-full", className)}
      data-tour="canvas"
    >
      {is2D ? (
        <ContourPlot2D {...innerProps} />
      ) : (
        <ContourPlot1D {...innerProps} />
      )}
    </div>
  );
}
