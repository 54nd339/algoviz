"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type {
  BTreeNode,
  HuffmanNode,
  NodeVariant,
  TreeNode,
  TrieNode,
} from "@/lib/algorithms/data-structures";
import { cn } from "@/lib/utils";
import {
  H_GAP,
  layoutBinaryTree,
  layoutBTree,
  type LayoutNode,
  layoutTrie,
  NODE_HALF_H,
  NODE_SIZE,
  V_GAP,
  WIDE_NODE_W,
} from "@/lib/utils/tree-layout";

interface TreeRendererProps {
  root: TreeNode | BTreeNode | TrieNode | HuffmanNode | null;
  highlightNodes?: string[];
  highlightEdges?: [string, string][];
  variant?: NodeVariant;
  className?: string;
}

export function TreeRenderer({
  root,
  highlightNodes = [],
  highlightEdges = [],
  variant = "circle",
  className,
}: TreeRendererProps) {
  const shouldReduceMotion = useReducedMotion();
  const highlightNodeSet = useMemo(
    () => new Set(highlightNodes),
    [highlightNodes],
  );
  const highlightEdgeSet = useMemo(
    () => new Set(highlightEdges.map(([a, b]) => `${a}-${b}`)),
    [highlightEdges],
  );

  const layout = useMemo(() => {
    if (!root) return { nodes: [], edges: [] };
    if (variant === "wide-rect" && "keys" in root) {
      return layoutBTree(root as BTreeNode, highlightNodeSet, highlightEdgeSet);
    }
    if (variant === "small-char" && "children" in root && !("left" in root)) {
      return layoutTrie(root as TrieNode, highlightNodeSet, highlightEdgeSet);
    }
    return layoutBinaryTree(
      root as TreeNode | HuffmanNode,
      highlightNodeSet,
      highlightEdgeSet,
      variant,
    );
  }, [root, highlightNodeSet, highlightEdgeSet, variant]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, LayoutNode>();
    for (const n of layout.nodes) map.set(n.id, n);
    return map;
  }, [layout.nodes]);

  if (!root) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-12 font-mono text-sm text-text-muted",
          className,
        )}
      >
        Empty tree
      </div>
    );
  }

  const maxX = Math.max(...layout.nodes.map((n) => n.x), 0) + H_GAP;
  const maxY = Math.max(...layout.nodes.map((n) => n.y), 0) + V_GAP;

  return (
    <div className={cn("relative overflow-auto", className)} data-tour="canvas">
      <div
        className="relative"
        style={{
          width: maxX + NODE_SIZE,
          height: maxY + NODE_SIZE + 8,
          minWidth: "100%",
        }}
      >
        {/* SVG edges */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={maxX + NODE_SIZE}
          height={maxY + NODE_SIZE + 8}
        >
          <AnimatePresence>
            {layout.edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;
              const halfWFrom = (from.multiKey ? WIDE_NODE_W : NODE_SIZE) / 2;
              const halfWTo = (to.multiKey ? WIDE_NODE_W : NODE_SIZE) / 2;
              return (
                <motion.line
                  key={`${edge.from}-${edge.to}`}
                  x1={from.x + halfWFrom}
                  y1={from.y + NODE_HALF_H}
                  x2={to.x + halfWTo}
                  y2={to.y + NODE_HALF_H}
                  className={cn(
                    "stroke-current",
                    edge.isHighlighted ? "text-accent-green" : "text-zinc-600",
                  )}
                  strokeWidth={edge.isHighlighted ? 2 : 1}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                />
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Nodes */}
        <AnimatePresence>
          {layout.nodes.map((node) => {
            const isCircle =
              variant === "circle" || variant === "colored-circle";
            const isWide = node.multiKey || variant === "wide-rect";
            const isSmallChar = variant === "small-char";

            return (
              <motion.div
                key={node.id}
                layout={!shouldReduceMotion}
                initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 26 }}
                className={cn(
                  "absolute flex items-center justify-center border font-mono text-xs transition-colors",
                  isWide && "h-10 min-w-[72px] rounded-md px-2",
                  isCircle && "h-10 w-10 rounded-full",
                  isSmallChar && "h-8 w-8 rounded-full text-[10px]",
                  node.isHighlighted
                    ? "border-accent-green bg-accent-green/20 text-accent-green shadow-[0_0_12px_var(--color-accent-green)/20%]"
                    : variant === "colored-circle" && node.color === "red"
                      ? "border-red-500 bg-red-500/20 text-red-400"
                      : variant === "colored-circle" && node.color === "black"
                        ? "border-zinc-500 bg-zinc-800 text-zinc-300"
                        : "border-zinc-700 bg-zinc-900 text-zinc-300",
                  node.isEnd &&
                    "ring-2 ring-accent-cyan ring-offset-1 ring-offset-zinc-950",
                )}
                style={{ left: node.x, top: node.y }}
              >
                <span className="truncate">{node.label}</span>
                {node.sublabel && (
                  <span className="absolute -bottom-4 text-[9px] text-text-muted">
                    {node.sublabel}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
