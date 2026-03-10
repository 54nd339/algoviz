"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { StringMatchStep } from "@/lib/algorithms/string";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface StringCanvasProps {
  step: AlgorithmStep<StringMatchStep> | null;
  className?: string;
}

function getCharColor(
  index: number,
  data: StringMatchStep,
  isPatternRow: boolean,
): string {
  const { mismatchAt, patternOffset } = data;
  const found = data.found ?? [];
  const matchedChars = data.matchedChars ?? [];

  if (!isPatternRow) {
    for (const pos of found) {
      const patLen = data.pattern?.length ?? 0;
      if (index >= pos && index < pos + patLen) {
        return "border-green-500 bg-green-500/20 text-green-400";
      }
    }
    if (mismatchAt !== undefined && index === mismatchAt) {
      return "border-red-400 bg-red-400/15 text-red-400";
    }
    if (matchedChars.includes(index)) {
      return "border-green-400 bg-green-400/15 text-green-400";
    }
    if (index === data.textIndex) {
      return "border-cyan-400 bg-cyan-400/15 text-cyan-400";
    }
    return "border-zinc-700 bg-zinc-800/50 text-text-primary";
  }

  const patternCharIndex = index - patternOffset;
  const patternLen = data.pattern?.length ?? 0;
  if (patternCharIndex < 0 || patternCharIndex >= patternLen) {
    return "border-transparent bg-transparent text-transparent";
  }

  if (mismatchAt !== undefined && index === mismatchAt) {
    return "border-red-400 bg-red-400/15 text-red-400";
  }
  if (matchedChars.includes(index)) {
    return "border-green-400 bg-green-400/15 text-green-400";
  }

  const isBeingCompared =
    data.textIndex >= 0 && patternCharIndex === data.patternIndex;
  if (isBeingCompared) {
    return "border-cyan-400 bg-cyan-400/15 text-cyan-400";
  }

  return "border-zinc-700 bg-zinc-800/50 text-text-secondary";
}

export function StringCanvas({ step, className }: StringCanvasProps) {
  const reducedMotion = useReducedMotion();
  const data = step?.data;

  const text = typeof data?.text === "string" ? data.text : "";
  const pattern = typeof data?.pattern === "string" ? data.pattern : "";

  if (
    !data ||
    typeof data.text !== "string" ||
    typeof data.pattern !== "string"
  ) {
    return <EmptyCanvasState className={cn("h-48", className)} />;
  }

  const patternOffset = data.patternOffset ?? 0;
  const found = data.found ?? [];
  const isRightToLeft = data.algorithmId === "boyer-moore";

  return (
    <div className={cn("space-y-6", className)} data-tour="canvas">
      {/* Direction indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-[10px] text-text-muted">
          Scan direction:
        </span>
        {isRightToLeft ? (
          <span className="flex items-center gap-1 font-mono text-xs text-amber-400">
            <ArrowLeft size={12} /> Right to Left
          </span>
        ) : (
          <span className="flex items-center gap-1 font-mono text-xs text-cyan-400">
            Left to Right <ArrowRight size={12} />
          </span>
        )}
        {found.length > 0 && (
          <span className="ml-4 rounded border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-mono text-[10px] text-green-400">
            {found.length} match{found.length > 1 ? "es" : ""} found
          </span>
        )}
      </div>

      <div>
        <div className="mb-1 font-mono text-[10px] text-text-muted">Text:</div>
        <div className="flex flex-wrap gap-0.5">
          {text.split("").map((ch, i) => (
            <motion.div
              key={`t-${i}`}
              layout
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                duration: reducedMotion ? 0 : undefined,
              }}
              className="flex flex-col items-center"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded border font-mono text-xs font-medium transition-colors sm:h-10 sm:w-10 sm:text-sm",
                  getCharColor(i, data, false),
                )}
              >
                {ch}
              </div>
              <span className="mt-0.5 font-mono text-[8px] text-zinc-600">
                {i}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 font-mono text-[10px] text-text-muted">
          Pattern:
        </div>
        <div className="flex flex-wrap gap-0.5">
          {text.split("").map((_, i) => {
            const patIdx = i - patternOffset;
            const inRange = patIdx >= 0 && patIdx < pattern.length;
            const ch = inRange ? pattern[patIdx] : "";

            return (
              <motion.div
                key={`p-${i}`}
                layout
                animate={{
                  opacity: inRange ? 1 : 0.15,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  duration: reducedMotion ? 0 : undefined,
                }}
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded border font-mono text-xs font-medium transition-colors sm:h-10 sm:w-10 sm:text-sm",
                    inRange
                      ? getCharColor(i, data, true)
                      : "border-transparent bg-transparent text-transparent",
                  )}
                >
                  {ch}
                </div>
                <span className="mt-0.5 font-mono text-[8px] text-zinc-600">
                  {inRange ? patIdx : ""}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Comparisons */}
      <div className="flex justify-center gap-4">
        <span className="font-mono text-[11px] text-text-muted">
          Comparisons:{" "}
          <span className="text-accent-cyan">{data.comparisons}</span>
        </span>
        {data.hashValue !== undefined && (
          <span className="font-mono text-[11px] text-text-muted">
            Window hash:{" "}
            <span className="text-amber-400">{data.hashValue}</span>
            {data.patternHash !== undefined && (
              <>
                {" "}
                / Pattern hash:{" "}
                <span className="text-violet-400">{data.patternHash}</span>
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
