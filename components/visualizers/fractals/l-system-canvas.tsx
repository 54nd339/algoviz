"use client";

import { useEffect, useRef } from "react";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { LSystemStep } from "@/lib/algorithms/fractals";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface LSystemCanvasProps {
  step: AlgorithmStep<LSystemStep> | null;
  className?: string;
}

export function LSystemCanvas({ step, className }: LSystemCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    cancelAnimationFrame(animRef.current);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!step?.data?.segments?.length) return;

    const { segments } = step.data;
    let drawn = 0;
    const batchSize = Math.max(1, Math.floor(segments.length / 60));

    function drawBatch() {
      if (!ctx || drawn >= segments.length) return;
      const end = Math.min(drawn + batchSize, segments.length);

      for (let i = drawn; i < end; i++) {
        const seg = segments[i];
        const t = i / segments.length;
        const hue = 120 + t * 120;
        ctx.strokeStyle = `hsl(${hue}, 70%, 55%)`;
        ctx.lineWidth = Math.max(0.5, 1.5 - t);
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }

      drawn = end;
      if (drawn < segments.length) {
        animRef.current = requestAnimationFrame(drawBatch);
      }
    }

    drawBatch();

    return () => cancelAnimationFrame(animRef.current);
  }, [step]);

  if (!step?.data) {
    return (
      <EmptyCanvasState
        message="Select an L-System preset and press play"
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-border bg-bg-primary/50 p-4",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="L-System fractal"
        width={500}
        height={500}
        className="rounded"
      />
    </div>
  );
}
