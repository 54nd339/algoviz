"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { LinkedListState } from "@/lib/algorithms/data-structures";
import { cn } from "@/lib/utils";

import {
  getNodeClasses,
  REDUCED_TRANSITION,
  SPRING_TRANSITION,
} from "./linear-renderer-shared";
import { ArrowToNext, NullPointer } from "./linked-list-parts";

interface LinkedListRendererProps {
  state: LinkedListState;
  highlightNodes?: string[];
  highlightEdges?: [string, string][];
  className?: string;
}

export function LinkedListRenderer({
  state,
  highlightNodes = [],
  highlightEdges = [],
  className,
}: LinkedListRendererProps) {
  const shouldReduceMotion = useReducedMotion();
  const highlights = new Set(highlightNodes);
  const edgeHighlights = new Set(highlightEdges.map(([a, b]) => `${a}-${b}`));
  const transition = shouldReduceMotion ? REDUCED_TRANSITION : SPRING_TRANSITION;

  // Prevents infinite loop on cyclic refs
  const ordered: typeof state.nodes = [];
  const visited = new Set<string>();
  let currentId = state.head;
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = state.nodes.find((n) => n.id === currentId);
    if (!node) break;
    ordered.push(node);
    currentId = node.next;
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        <AnimatePresence mode="popLayout">
          {ordered.map((node, i) => {
            const isHead = node.id === state.head;
            const isTail = node.id === state.tail;
            const isHighlighted = highlights.has(node.id);
            const nextNode = i < ordered.length - 1 ? ordered[i + 1] : null;
            const edgeHighlighted = nextNode
              ? edgeHighlights.has(`${node.id}-${nextNode.id}`)
              : false;

            return (
              <motion.div
                key={node.id}
                layout={!shouldReduceMotion}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: -20 }
                }
                transition={transition}
                className="flex items-center"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-4 gap-1">
                    {isHead && (
                      <span className="font-mono text-[9px] text-accent-cyan">
                        head
                      </span>
                    )}
                    {isTail && (
                      <span className="font-mono text-[9px] text-amber-400">
                        tail
                      </span>
                    )}
                  </div>
                  <div
                    className={getNodeClasses(
                      isHighlighted,
                      "flex h-10 w-14 items-center justify-center rounded-md border font-mono text-sm",
                    )}
                  >
                    {node.value}
                  </div>
                </div>
                {nextNode && (
                  <ArrowToNext
                    highlighted={edgeHighlighted}
                    doubly={state.doubly}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {ordered.length > 0 && <NullPointer />}
      </div>
      {ordered.length === 0 && (
        <div className="py-4 font-mono text-xs text-text-muted">Empty list</div>
      )}
      <div className="font-mono text-[10px] text-text-muted">
        {state.doubly ? "doubly" : "singly"} linked · {ordered.length} node(s)
      </div>
    </div>
  );
}
