"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { QueueState } from "@/lib/algorithms/data-structures";
import { cn } from "@/lib/utils";

import {
  getNodeClasses,
  REDUCED_TRANSITION,
  SPRING_TRANSITION,
} from "./linear-renderer-shared";

interface QueueRendererProps {
  state: QueueState;
  highlightNodes?: string[];
  className?: string;
}

export function QueueRenderer({
  state,
  highlightNodes = [],
  className,
}: QueueRendererProps) {
  const shouldReduceMotion = useReducedMotion();
  const highlights = new Set(highlightNodes);
  const transition = shouldReduceMotion ? REDUCED_TRANSITION : SPRING_TRANSITION;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <span className="mr-2 font-mono text-[10px] text-text-muted">
          front →
        </span>
        <div className="flex min-h-[40px] items-center gap-1">
          <AnimatePresence mode="popLayout">
            {state.items.map((item, i) => (
              <motion.div
                key={`${i}-${item}`}
                layout={!shouldReduceMotion}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.5 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.5 }
                }
                transition={transition}
                className={getNodeClasses(
                  highlights.has(String(i)),
                  "flex h-10 w-12 items-center justify-center rounded-md border font-mono text-sm",
                )}
              >
                {item}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <span className="ml-2 font-mono text-[10px] text-text-muted">
          ← rear
        </span>
      </div>
      {state.items.length === 0 && (
        <div className="font-mono text-xs text-text-muted">Empty queue</div>
      )}
      <div className="font-mono text-[10px] text-text-muted">
        size: {state.items.length}
      </div>
    </div>
  );
}
