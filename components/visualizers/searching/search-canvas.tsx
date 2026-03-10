"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { SearchStep } from "@/lib/algorithms/searching";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface SearchCanvasProps {
  step: AlgorithmStep<SearchStep> | null;
  className?: string;
}

function getCellColor(index: number, data: SearchStep): string {
  if (data.found !== undefined && data.found === index)
    return "border-green-400 bg-green-400/20 text-green-400";
  if (data.current !== undefined && data.current === index)
    return "border-cyan-400 bg-cyan-400/15 text-cyan-400";
  if (data.mid !== undefined && data.mid === index)
    return "border-violet-400 bg-violet-400/15 text-violet-400";
  if (data.left === index || data.right === index)
    return "border-amber-400 bg-amber-400/10 text-amber-400";
  if ((data.eliminated ?? []).includes(index))
    return "border-zinc-800 bg-zinc-900/50 text-zinc-700";
  return "border-zinc-600 bg-zinc-800/50 text-text-primary";
}

function getPointerLabel(index: number, data: SearchStep): string | null {
  const labels: string[] = [];
  if (data.left === index) labels.push("L");
  if (data.right === index) labels.push("R");
  if (data.mid === index) labels.push("M");
  if (data.current !== undefined && data.current === index && !labels.length)
    labels.push("i");
  return labels.length > 0 ? labels.join(",") : null;
}

export function SearchCanvas({ step, className }: SearchCanvasProps) {
  const reducedMotion = useReducedMotion();
  const data = step?.data;

  const array = Array.isArray(data?.array) ? data.array : [];

  if (!data || array.length === 0) {
    return <EmptyCanvasState className={cn("h-48", className)} />;
  }

  const target = data.target;

  return (
    <div className={cn("space-y-4", className)} data-tour="canvas">
      {/* Target display */}
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-xs text-text-muted">Target:</span>
        <span className="rounded border border-accent-green bg-accent-green/10 px-3 py-1 font-mono text-lg font-bold text-accent-green">
          {target}
        </span>
        {data.found !== undefined && data.found >= 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            className="font-mono text-xs text-green-400"
          >
            Found at index {data.found}!
          </motion.span>
        )}
        {data.found === -1 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            className="font-mono text-xs text-red-400"
          >
            Not found
          </motion.span>
        )}
      </div>

      {/* Array cells */}
      <div className="flex flex-wrap items-end justify-center gap-1">
        {array.map((value, index) => {
          const cellColor = getCellColor(index, data);
          const pointer = getPointerLabel(index, data);
          const isEliminated = (data.eliminated ?? []).includes(index);

          return (
            <motion.div
              key={index}
              layout
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                duration: reducedMotion ? 0 : undefined,
              }}
              className="flex flex-col items-center gap-1"
            >
              <motion.div
                animate={{
                  opacity: isEliminated ? 0.4 : 1,
                  scale: isEliminated ? 0.9 : 1,
                }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded border font-mono text-xs font-medium transition-colors sm:h-11 sm:w-11 sm:text-sm",
                  cellColor,
                )}
              >
                {value}
              </motion.div>

              {/* Index label */}
              <span className="font-mono text-[9px] text-zinc-600">
                {index}
              </span>

              {/* Pointer arrows */}
              <div className="flex h-5 items-center justify-center">
                {pointer && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[8px] leading-none text-accent-cyan">
                      ▲
                    </span>
                    <span className="font-mono text-[9px] font-bold text-accent-cyan">
                      {pointer}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparisons counter */}
      <div className="flex justify-center">
        <span className="font-mono text-[11px] text-text-muted">
          Comparisons:{" "}
          <span className="text-accent-cyan">{data.comparisons}</span>
        </span>
      </div>
    </div>
  );
}
