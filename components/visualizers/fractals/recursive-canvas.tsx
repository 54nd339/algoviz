"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { RecursiveFractalStep } from "@/lib/algorithms/fractals";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface RecursiveCanvasProps {
  step: AlgorithmStep<RecursiveFractalStep> | null;
  className?: string;
}

export function RecursiveCanvas({ step, className }: RecursiveCanvasProps) {
  const reducedMotion = useReducedMotion();

  if (!step?.data) {
    return (
      <EmptyCanvasState
        message="Select a fractal and press play"
        className={className}
      />
    );
  }

  const { shapes, depth, maxDepth, fractalType } = step.data;
  const viewBox = fractalType === "koch" ? "0 0 500 450" : "0 0 500 440";

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-lg border border-border bg-bg-primary/50 p-4",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      <svg
        viewBox={viewBox}
        className="h-full max-h-[70vh] w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {shapes.map((shape, i) => {
          const opacity = Math.max(
            0.3,
            1 - (shape.depth / (maxDepth + 1)) * 0.5,
          );
          const hue = fractalType === "sierpinski" ? 160 : 190;
          const lightness = 50 + (shape.depth / maxDepth) * 20;

          if (shape.type === "triangle") {
            const points = shape.points.map((p) => `${p.x},${p.y}`).join(" ");
            return (
              <motion.polygon
                key={`t-${i}`}
                points={points}
                fill={`hsl(${hue}, 70%, ${lightness}%)`}
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity, scale: 1 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.3,
                  delay: reducedMotion ? 0 : Math.min(i * 0.002, 0.5),
                }}
              />
            );
          }

          if (shape.type === "line") {
            return (
              <motion.line
                key={`l-${i}`}
                x1={shape.points[0].x}
                y1={shape.points[0].y}
                x2={shape.points[1].x}
                y2={shape.points[1].y}
                stroke={`hsl(${hue}, 80%, ${lightness}%)`}
                strokeWidth={Math.max(0.3, 2 - depth * 0.2)}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity }}
                transition={{
                  duration: reducedMotion ? 0 : 0.2,
                  delay: reducedMotion ? 0 : Math.min(i * 0.001, 0.5),
                }}
              />
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
}
