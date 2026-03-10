"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { HashStep } from "@/lib/algorithms/crypto";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface HashCompareProps {
  step: AlgorithmStep<HashStep> | null;
  className?: string;
}

export function HashCompare({ step, className }: HashCompareProps) {
  const reducedMotion = useReducedMotion();

  if (!step?.data) {
    return (
      <EmptyCanvasState
        message="Select Hash Avalanche and press play"
        className={className}
      />
    );
  }

  const {
    inputA,
    inputB,
    hashA,
    hashB,
    binaryA,
    binaryB,
    differingBits,
    totalBits,
    changePercentage,
    currentChar,
  } = step.data;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-bg-primary/50 p-4",
        className,
      )}
    >
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-text-muted">
            Input A (original)
          </span>
          <div className="flex flex-wrap gap-0.5">
            {inputA.split("").map((c, i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded border border-border bg-zinc-800 font-mono text-sm"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="font-mono text-xs text-text-muted">
            Hash: <span className="text-cyan-400">0x{hashA}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="font-mono text-[10px] text-text-muted">
            Input B (modified)
          </span>
          <div className="flex flex-wrap gap-0.5">
            {inputB.split("").map((c, i) => (
              <span
                key={i}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded border font-mono text-sm",
                  i === currentChar
                    ? "border-red-500/50 bg-red-500/20 text-red-400"
                    : "border-border bg-zinc-800",
                )}
              >
                {c}
              </span>
            ))}
          </div>
          <div className="font-mono text-xs text-text-muted">
            Hash: <span className="text-amber-400">0x{hashB}</span>
          </div>
        </div>
      </div>

      {/* Binary Comparison */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-text-muted">
          Bit-level comparison (32-bit hash)
        </span>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="w-8 shrink-0 font-mono text-[9px] text-text-muted">
              A:
            </span>
            <div className="flex flex-wrap gap-px">
              {binaryA.split("").map((bit, i) => (
                <span
                  key={`a-${i}`}
                  className={cn(
                    "flex h-5 w-4 items-center justify-center font-mono text-[10px]",
                    differingBits.includes(i)
                      ? "font-bold text-cyan-400"
                      : "text-text-muted",
                  )}
                >
                  {bit}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-8 shrink-0 font-mono text-[9px] text-text-muted">
              B:
            </span>
            <div className="flex flex-wrap gap-px">
              {binaryB.split("").map((bit, i) => (
                <motion.span
                  key={`b-${i}`}
                  className={cn(
                    "flex h-5 w-4 items-center justify-center font-mono text-[10px]",
                    differingBits.includes(i)
                      ? "rounded bg-red-500/10 font-bold text-red-400"
                      : "text-text-muted",
                  )}
                  initial={
                    differingBits.includes(i) ? { scale: 1.3 } : undefined
                  }
                  animate={{ scale: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                >
                  {bit}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-8 shrink-0 font-mono text-[9px] text-text-muted">
              Diff:
            </span>
            <div className="flex flex-wrap gap-px">
              {binaryA.split("").map((_, i) => (
                <span
                  key={`d-${i}`}
                  className={cn(
                    "flex h-5 w-4 items-center justify-center font-mono text-[10px]",
                    differingBits.includes(i)
                      ? "text-amber-400"
                      : "text-zinc-700",
                  )}
                >
                  {differingBits.includes(i) ? "×" : "·"}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded border border-border bg-zinc-900/50 p-2 text-center">
          <div className="font-mono text-[10px] text-text-muted">
            Different Bits
          </div>
          <div className="font-mono text-lg text-red-400">
            {differingBits.length}
          </div>
        </div>
        <div className="rounded border border-border bg-zinc-900/50 p-2 text-center">
          <div className="font-mono text-[10px] text-text-muted">
            Total Bits
          </div>
          <div className="font-mono text-lg text-text-primary">{totalBits}</div>
        </div>
        <div className="rounded border border-border bg-zinc-900/50 p-2 text-center">
          <div className="font-mono text-[10px] text-text-muted">Change %</div>
          <div
            className={cn(
              "font-mono text-lg",
              changePercentage >= 40 && changePercentage <= 60
                ? "text-green-400"
                : "text-amber-400",
            )}
          >
            {changePercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {changePercentage > 0 && (
        <div className="text-center font-mono text-xs text-text-muted">
          {changePercentage >= 40 && changePercentage <= 60
            ? "Good avalanche effect (~50% bit change)"
            : "Avalanche effect varies per position"}
        </div>
      )}
    </div>
  );
}
