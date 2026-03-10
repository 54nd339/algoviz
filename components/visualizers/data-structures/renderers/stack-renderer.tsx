"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { StackState } from "@/lib/algorithms/data-structures";
import { cn } from "@/lib/utils";

import {
  getNodeClasses,
  REDUCED_TRANSITION,
  SPRING_TRANSITION,
} from "./linear-renderer-shared";

interface StackRendererProps {
  state: StackState;
  highlightNodes?: string[];
  className?: string;
}

export function StackRenderer({
  state,
  highlightNodes = [],
  className,
}: StackRendererProps) {
  const shouldReduceMotion = useReducedMotion();
  const highlights = new Set(highlightNodes);
  const transition = shouldReduceMotion ? REDUCED_TRANSITION : SPRING_TRANSITION;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="mb-1 font-mono text-[10px] text-text-muted">
        top ↓ (size: {state.items.length})
      </div>
      <div className="flex min-h-[80px] flex-col-reverse gap-1">
        <AnimatePresence mode="popLayout">
          {state.items.map((item, i) => (
            <motion.div
              key={`${i}-${item}`}
              layout={!shouldReduceMotion}
              initial={
                shouldReduceMotion
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -30 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: 30 }
              }
              transition={transition}
              className={getNodeClasses(
                highlights.has(String(i)),
                "flex h-10 w-16 items-center justify-center rounded-md border font-mono text-sm",
              )}
            >
              {item}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {state.items.length === 0 && (
        <div className="py-4 font-mono text-xs text-text-muted">
          Empty stack
        </div>
      )}
      <div className="mt-1 h-0.5 w-20 rounded bg-zinc-700" />
      <div className="font-mono text-[10px] text-text-muted">bottom</div>
    </div>
  );
}
