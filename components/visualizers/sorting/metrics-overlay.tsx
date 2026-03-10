"use client";

import type { SortStep } from "@/lib/algorithms/sorting";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface MetricsOverlayProps {
  step: AlgorithmStep<SortStep> | null;
  className?: string;
}

export function MetricsOverlay({ step, className }: MetricsOverlayProps) {
  const data = step?.data;
  if (!data) return null;

  return (
    <div
      className={cn("flex items-center gap-4 font-mono text-[11px]", className)}
    >
      <span className="text-text-muted">
        Comparisons:{" "}
        <span className="text-accent-cyan">{data.comparisons}</span>
      </span>
      <span className="text-text-muted">
        Swaps: <span className="text-amber-400">{data.swaps}</span>
      </span>
      <span className="text-text-muted">
        Accesses:{" "}
        <span className="text-text-secondary">{data.arrayAccesses}</span>
      </span>
    </div>
  );
}
