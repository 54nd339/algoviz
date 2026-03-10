"use client";

import { useCallback, useRef } from "react";

import type { ColorPalette } from "@/lib/algorithms/fractals";
import { cn } from "@/lib/utils";
import { useCanvasResize } from "@/hooks/use-canvas-resize";
import { useFractalRender } from "@/hooks/use-fractal-render";

interface MandelbrotCanvasProps {
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  colorPalette: ColorPalette;
  isJulia?: boolean;
  cReal?: number;
  cImag?: number;
  onZoomChange?: (zoom: number, cx: number, cy: number) => void;
  className?: string;
}

export function MandelbrotCanvas({
  maxIterations,
  zoom,
  centerX,
  centerY,
  colorPalette,
  isJulia = false,
  cReal = 0,
  cImag = 0,
  onZoomChange,
  className,
}: MandelbrotCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    cx: number;
    cy: number;
  } | null>(null);
  const { width, height } = useCanvasResize(containerRef);
  const effectiveIterations = Math.max(
    maxIterations,
    Math.min(5000, Math.floor(maxIterations + Math.log2(zoom + 1) * 80)),
  );

  const { computing, threadCount } = useFractalRender({
    canvasRef,
    width,
    height,
    centerX,
    centerY,
    zoom,
    effectiveIterations,
    colorPalette,
    isJulia,
    cReal,
    cImag,
  });

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!onZoomChange) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const scale = 3.5 / (width * zoom);

      const worldX = (mx - width / 2) * scale + centerX;
      const worldY = (my - height / 2) * scale + centerY;

      const factor = e.deltaY < 0 ? 1.3 : 1 / 1.3;
      const newZoom = zoom * factor;
      const newScale = 3.5 / (width * newZoom);
      const newCx = worldX - (mx - width / 2) * newScale;
      const newCy = worldY - (my - height / 2) * newScale;

      onZoomChange(newZoom, newCx, newCy);
    },
    [zoom, centerX, centerY, width, height, onZoomChange],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        cx: centerX,
        cy: centerY,
      };
    },
    [centerX, centerY],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragRef.current || !onZoomChange) return;
      const scale = 3.5 / (width * zoom);
      const dx = (e.clientX - dragRef.current.startX) * scale;
      const dy = (e.clientY - dragRef.current.startY) * scale;
      onZoomChange(zoom, dragRef.current.cx - dx, dragRef.current.cy - dy);
    },
    [zoom, width, onZoomChange],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full", className)}
      data-tour="canvas"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Fractal visualization"
        width={width}
        height={height}
        className={cn(
          "absolute inset-0 h-full w-full cursor-crosshair rounded-lg border border-border",
          zoom > 50 ? "[image-rendering:auto]" : "[image-rendering:pixelated]",
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] text-text-muted">
        zoom: {zoom.toFixed(1)}x | iters: {effectiveIterations}
        {threadCount > 0 && ` | ${threadCount} threads`}
      </div>
      {computing && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-2">
          <span className="animate-pulse rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-accent-green">
            Computing...
          </span>
        </div>
      )}
    </div>
  );
}
