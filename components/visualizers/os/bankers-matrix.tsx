"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { BankerStep } from "@/lib/algorithms/os";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface BankersMatrixProps {
  step: AlgorithmStep<BankerStep> | null;
  className?: string;
}

function Matrix({
  title,
  data,
  processNames,
  resourceNames,
  highlightRow,
}: {
  title: string;
  data: number[][];
  processNames: string[];
  resourceNames: string[];
  highlightRow: string | null;
}) {
  return (
    <div className="rounded border border-border bg-zinc-900/50 p-2">
      <div className="mb-1 font-mono text-[10px] text-text-muted">{title}</div>
      <table className="w-full font-mono text-xs">
        <thead>
          <tr className="text-text-muted">
            <th className="p-0.5 text-left" />
            {resourceNames.map((r) => (
              <th key={r} className="p-0.5 text-center">
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isHighlight = processNames[i] === highlightRow;
            return (
              <tr
                key={processNames[i]}
                className={cn(
                  "border-t border-border/30",
                  isHighlight && "bg-accent-green/10",
                )}
              >
                <td className="p-0.5 text-text-muted">{processNames[i]}</td>
                {row.map((v, j) => (
                  <td key={j} className="p-0.5 text-center">
                    {v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function BankersMatrix({ step, className }: BankersMatrixProps) {
  const reducedMotion = useReducedMotion();
  const d = step?.data;
  if (!d || !Array.isArray(d.available) || !Array.isArray(d.max)) {
    return (
      <EmptyCanvasState
        message="Select Banker's Algorithm and press play"
        className={className}
      />
    );
  }

  const {
    available,
    max,
    allocation,
    need,
    safeSequence,
    currentProcess,
    isSafe,
    checking,
    processNames,
    resourceNames,
  } = d;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4",
        className,
      )}
    >
      {/* Available */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-text-muted">Available:</span>
        <div className="flex gap-1">
          {available.map((v, i) => (
            <span
              key={i}
              className="rounded border border-border bg-zinc-800 px-2 py-0.5 font-mono text-xs"
            >
              {resourceNames[i]}={v}
            </span>
          ))}
        </div>
      </div>

      {/* Matrices */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Matrix
          title="Max"
          data={max}
          processNames={processNames}
          resourceNames={resourceNames}
          highlightRow={currentProcess}
        />
        <Matrix
          title="Allocation"
          data={allocation}
          processNames={processNames}
          resourceNames={resourceNames}
          highlightRow={currentProcess}
        />
        <Matrix
          title="Need"
          data={need}
          processNames={processNames}
          resourceNames={resourceNames}
          highlightRow={currentProcess}
        />
        <div className="rounded border border-border bg-zinc-900/50 p-2">
          <div className="mb-1 font-mono text-[10px] text-text-muted">
            Status
          </div>
          <div
            className={cn(
              "rounded p-2 font-mono text-xs",
              isSafe
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400",
            )}
          >
            {checking}
          </div>
        </div>
      </div>

      {/* Safe Sequence */}
      <div className="flex items-center gap-2">
        <span className="shrink-0 font-mono text-xs text-text-muted">
          Safe Sequence:
        </span>
        <div className="flex gap-1">
          {safeSequence.map((p, i) => (
            <motion.span
              key={`${p}-${i}`}
              className="rounded bg-green-500/20 px-2 py-0.5 font-mono text-xs font-bold text-green-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.3,
                delay: reducedMotion ? 0 : i * 0.1,
              }}
            >
              {p}
            </motion.span>
          ))}
          {safeSequence.length === 0 && (
            <span className="font-mono text-xs text-text-muted">
              building...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
