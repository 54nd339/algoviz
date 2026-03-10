"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { PageStep } from "@/lib/algorithms/os";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface PageFramesProps {
  step: AlgorithmStep<PageStep> | null;
  className?: string;
}

export function PageFrames({ step, className }: PageFramesProps) {
  const reducedMotion = useReducedMotion();
  const d = step?.data;
  if (!d || !Array.isArray(d.referenceString) || !Array.isArray(d.frames)) {
    return (
      <EmptyCanvasState
        message="Select a page replacement algorithm and press play"
        className={className}
      />
    );
  }

  const {
    referenceString,
    frames,
    pageFault,
    pageHit,
    evicted,
    faultCount,
    hitCount,
    hitRatio,
    referenceIndex,
    frameCount,
    reference,
  } = d;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4",
        className,
      )}
    >
      {/* Reference String */}
      <div className="space-y-1">
        <span className="font-mono text-xs text-text-muted">
          Reference String
        </span>
        <div className="flex flex-wrap gap-1">
          {referenceString.map((page, i) => (
            <span
              key={i}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded border font-mono text-xs",
                i === referenceIndex
                  ? pageFault
                    ? "border-red-500 bg-red-500/20 text-red-400"
                    : "border-green-500 bg-green-500/20 text-green-400"
                  : i < referenceIndex
                    ? "border-border/50 bg-zinc-900/30 text-text-muted"
                    : "border-border bg-zinc-900/50 text-text-primary",
              )}
            >
              {page}
            </span>
          ))}
        </div>
      </div>

      {/* Page Frames */}
      <div className="space-y-1">
        <span className="font-mono text-xs text-text-muted">
          Page Frames ({frameCount})
        </span>
        <div className="flex gap-2">
          {frames.map((page, i) => (
            <div key={i} className="relative">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={page ?? `empty-${i}`}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-lg border-2 font-mono text-lg font-bold",
                    page === null
                      ? "border-dashed border-border text-text-muted"
                      : page === reference && pageHit
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : page === reference && pageFault
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : "border-border bg-zinc-900 text-text-primary",
                  )}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3 }}
                >
                  {page ?? "—"}
                </motion.div>
              </AnimatePresence>
              <span className="mt-1 block text-center font-mono text-[9px] text-text-muted">
                F{i}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      {referenceIndex >= 0 && (
        <div className="flex items-center gap-3">
          {pageFault && (
            <motion.span
              className="rounded bg-red-500/20 px-2 py-1 font-mono text-xs font-bold text-red-400"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              PAGE FAULT {evicted !== null && `(evicted: ${evicted})`}
            </motion.span>
          )}
          {pageHit && (
            <motion.span
              className="rounded bg-green-500/20 px-2 py-1 font-mono text-xs font-bold text-green-400"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              PAGE HIT
            </motion.span>
          )}
        </div>
      )}

      {/* Counters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded border border-border bg-zinc-900/50 p-2 text-center">
          <div className="font-mono text-[10px] text-text-muted">Faults</div>
          <div className="font-mono text-lg text-red-400">{faultCount}</div>
        </div>
        <div className="rounded border border-border bg-zinc-900/50 p-2 text-center">
          <div className="font-mono text-[10px] text-text-muted">Hits</div>
          <div className="font-mono text-lg text-green-400">{hitCount}</div>
        </div>
        <div className="rounded border border-border bg-zinc-900/50 p-2 text-center">
          <div className="font-mono text-[10px] text-text-muted">Hit Ratio</div>
          <div className="font-mono text-lg text-text-primary">
            {(hitRatio * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
