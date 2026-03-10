"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type {
  HashEntry,
  HashTableState,
} from "@/lib/algorithms/data-structures";
import { cn } from "@/lib/utils";

interface HashRendererProps {
  state: HashTableState;
  highlightNodes?: string[];
  className?: string;
}

function ChainEntries({
  entry,
  depth = 0,
  reducedMotion,
}: {
  entry: HashEntry | null;
  depth?: number;
  reducedMotion: boolean;
}) {
  if (!entry) return null;
  return (
    <div className="flex items-center gap-0.5">
      <svg width="16" height="10" viewBox="0 0 16 10" className="flex-shrink-0">
        <line
          x1="0"
          y1="5"
          x2="10"
          y2="5"
          className="stroke-current text-zinc-600"
          strokeWidth={1}
        />
        <polygon
          points="10,2 16,5 10,8"
          className="fill-current text-zinc-600"
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.3 }}
        className="flex flex-shrink-0 items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300"
      >
        <span className="text-accent-cyan">{entry.key}</span>
        <span className="text-text-muted">:</span>
        <span>{entry.value}</span>
      </motion.div>
      {entry.next && (
        <ChainEntries
          entry={entry.next}
          depth={depth + 1}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}

export function HashRenderer({
  state,
  highlightNodes = [],
  className,
}: HashRendererProps) {
  const reducedMotion = useReducedMotion();
  const highlights = new Set(highlightNodes);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="mb-2 flex items-center gap-3 font-mono text-[10px] text-text-muted">
        <span>mode: {state.mode}</span>
        <span>
          size: {state.size}/{state.capacity}
        </span>
        <span>load: {state.loadFactor.toFixed(2)}</span>
      </div>

      <div className="flex max-h-[60vh] flex-col gap-0.5 overflow-auto">
        {state.buckets.map((entry, i) => {
          const isHighlighted = highlights.has(String(i));
          return (
            <motion.div
              key={i}
              layout
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
              className="flex items-center gap-2"
            >
              {/* Bucket index */}
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border font-mono text-[10px]",
                  isHighlighted
                    ? "border-accent-green bg-accent-green/20 text-accent-green"
                    : "border-zinc-700 bg-zinc-900/50 text-text-muted",
                )}
              >
                {i}
              </div>

              {/* Bucket content */}
              {state.mode === "chaining" ? (
                <div className="flex min-h-[32px] items-center">
                  {entry ? (
                    <ChainEntries
                      entry={entry}
                      reducedMotion={reducedMotion ?? false}
                    />
                  ) : (
                    <span className="ml-4 font-mono text-[10px] text-zinc-600">
                      ∅
                    </span>
                  )}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {entry ? (
                    entry.key === "__DELETED__" ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: reducedMotion ? 0 : 0.3 }}
                        className="rounded border border-dashed border-zinc-700 px-2 py-1 font-mono text-[10px] text-zinc-600"
                      >
                        ⊘ deleted
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: reducedMotion ? 0 : 0.3 }}
                        className={cn(
                          "rounded border px-2 py-1 font-mono text-[10px]",
                          isHighlighted
                            ? "border-accent-green bg-accent-green/10 text-accent-green"
                            : "border-zinc-700 bg-zinc-900 text-zinc-300",
                        )}
                      >
                        <span className="text-accent-cyan">{entry.key}</span>
                        <span className="text-text-muted">: </span>
                        <span>{entry.value}</span>
                      </motion.div>
                    )
                  ) : (
                    <span className="ml-4 font-mono text-[10px] text-zinc-600">
                      —
                    </span>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
