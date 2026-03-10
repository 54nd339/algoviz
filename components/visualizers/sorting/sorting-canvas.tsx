"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { SortStep } from "@/lib/algorithms/sorting";
import { cn } from "@/lib/utils";
import { useCanvasResize } from "@/hooks/use-canvas-resize";
import type { AlgorithmStep } from "@/types";

interface SortingCanvasProps {
  step: AlgorithmStep<SortStep> | null;
  className?: string;
  compact?: boolean;
}

function getBarColor(index: number, step: Partial<SortStep>): string {
  if (Array.isArray(step.sorted) && step.sorted.includes(index))
    return "bg-green-400";
  if (step.pivot !== undefined && step.pivot === index) return "bg-violet-400";
  if (
    Array.isArray(step.swapping) &&
    (step.swapping[0] === index || step.swapping[1] === index)
  )
    return "bg-amber-400";
  if (
    Array.isArray(step.comparing) &&
    (step.comparing[0] === index || step.comparing[1] === index)
  )
    return "bg-cyan-400";
  return "bg-zinc-600";
}

function getBarGlow(index: number, step: Partial<SortStep>): string {
  if (
    Array.isArray(step.swapping) &&
    (step.swapping[0] === index || step.swapping[1] === index)
  )
    return "shadow-[0_0_8px_rgba(251,191,36,0.4)]";
  if (
    Array.isArray(step.comparing) &&
    (step.comparing[0] === index || step.comparing[1] === index)
  )
    return "shadow-[0_0_8px_rgba(34,211,238,0.3)]";
  return "";
}

const PADDING_X = 8;
const MIN_BAR_WIDTH = 2;
const GAP = 1;

export function SortingCanvas({
  step,
  className,
  compact = false,
}: SortingCanvasProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: containerWidth } = useCanvasResize(containerRef);
  const [identity, setIdentity] = useState<number[]>([]);
  const [trackedN, setTrackedN] = useState(0);
  const [trackedStepId, setTrackedStepId] = useState<unknown>(null);

  const data = step?.data;
  const array = Array.isArray(data?.array) ? data.array : [];
  const n = array.length;
  const stepId =
    data ? ((step as AlgorithmStep<SortStep> & { id?: unknown }).id ?? step) : null;

  if (n > 0 && n !== trackedN) {
    setTrackedN(n);
    setTrackedStepId(stepId);
    setIdentity(Array.from({ length: n }, (_, i) => i));
  } else if (n > 0 && stepId !== trackedStepId) {
    setTrackedStepId(stepId);
    if (data?.swapping) {
      const [i, j] = data.swapping;
      setIdentity((prev) => {
        const id = [...prev];
        [id[i], id[j]] = [id[j], id[i]];
        return id;
      });
    }
  }

  if (!data || array.length === 0) {
    return (
      <EmptyCanvasState
        ref={containerRef}
        className={cn(compact ? "h-32" : "h-64 sm:h-80", className)}
      />
    );
  }

  const maxVal = Math.max(...array, 1);
  const contentWidth = Math.max(0, containerWidth - PADDING_X);
  const barWidth =
    containerWidth > 0 && n > 0
      ? Math.max(MIN_BAR_WIDTH, (contentWidth - n * 2 * GAP) / n)
      : MIN_BAR_WIDTH;

  const layoutTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 35,
    mass: 0.6,
    duration: reducedMotion ? 0 : undefined,
  };

  return (
    <div
      ref={containerRef}
      data-tour="canvas"
      className={cn(
        "relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-bg-primary/50",
        compact ? "h-32" : "h-64 sm:h-80",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      <div
        className="flex h-full w-full min-w-0 items-end justify-center"
        style={{ padding: compact ? "4px" : "8px 4px" }}
      >
        <div
          className="flex h-full items-end justify-center"
          style={{
            width: n * (barWidth + 2 * GAP),
            maxWidth: "100%",
          }}
        >
          {array.map((value, index) => {
            const heightPercent = (value / maxVal) * 100;
            const color = getBarColor(index, data);
            const glow = getBarGlow(index, data);
            const barId = identity[index] ?? index;

            return (
              <motion.div
                key={barId}
                layout
                transition={layoutTransition}
                className={cn("shrink-0 rounded-t-sm", color, glow)}
                style={{
                  width: barWidth,
                  height: `${heightPercent}%`,
                  minHeight: 2,
                  marginLeft: GAP,
                  marginRight: GAP,
                }}
                title={compact ? undefined : `arr[${index}] = ${value}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
