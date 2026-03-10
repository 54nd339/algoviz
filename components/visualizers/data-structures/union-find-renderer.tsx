"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { UnionFindState } from "@/lib/algorithms/data-structures";
import { cn } from "@/lib/utils";

interface UnionFindRendererProps {
  state: UnionFindState;
  highlightNodes?: string[];
  highlightEdges?: [string, string][];
  className?: string;
}

interface UFTree {
  root: number;
  children: Map<number, number[]>;
}

function buildForest(parent: number[]): UFTree[] {
  const children = new Map<number, number[]>();
  const roots: number[] = [];

  for (let i = 0; i < parent.length; i++) {
    if (parent[i] === i) {
      roots.push(i);
    } else {
      if (!children.has(parent[i])) children.set(parent[i], []);
      children.get(parent[i])!.push(i);
    }
  }

  return roots.map((root) => ({ root, children }));
}

interface LayoutNode {
  id: number;
  x: number;
  y: number;
}

function layoutTree(
  node: number,
  children: Map<number, number[]>,
  depth: number,
  offset: number,
): { nodes: LayoutNode[]; width: number; edges: [number, number][] } {
  const kids = children.get(node) || [];

  if (kids.length === 0) {
    return {
      nodes: [{ id: node, x: offset, y: depth }],
      width: 1,
      edges: [],
    };
  }

  const childLayouts: {
    nodes: LayoutNode[];
    width: number;
    edges: [number, number][];
  }[] = [];
  let childOffset = offset;
  for (const kid of kids) {
    const cl = layoutTree(kid, children, depth + 1, childOffset);
    childLayouts.push(cl);
    childOffset += cl.width;
  }

  const totalWidth = childLayouts.reduce((acc, cl) => acc + cl.width, 0);
  const x = offset + totalWidth / 2 - 0.5;

  const allNodes: LayoutNode[] = [{ id: node, x, y: depth }];
  const allEdges: [number, number][] = [];

  for (let i = 0; i < kids.length; i++) {
    allNodes.push(...childLayouts[i].nodes);
    allEdges.push(...childLayouts[i].edges);
    allEdges.push([node, kids[i]]);
  }

  return { nodes: allNodes, width: Math.max(totalWidth, 1), edges: allEdges };
}

const H_SPACING = 52;
const V_SPACING = 60;
const NODE_R = 18;

export function UnionFindRenderer({
  state,
  highlightNodes = [],
  highlightEdges = [],
  className,
}: UnionFindRendererProps) {
  const reducedMotion = useReducedMotion();
  const highlightSet = useMemo(() => new Set(highlightNodes), [highlightNodes]);
  const edgeSet = useMemo(
    () => new Set(highlightEdges.map(([a, b]) => `${a}-${b}`)),
    [highlightEdges],
  );

  const forestLayout = useMemo(() => {
    if (state.parent.length === 0)
      return { nodes: [], edges: [] as [number, number][] };

    const forest = buildForest(state.parent);
    const allNodes: LayoutNode[] = [];
    const allEdges: [number, number][] = [];
    let offset = 0;

    for (const tree of forest) {
      const { nodes, edges, width } = layoutTree(
        tree.root,
        tree.children,
        0,
        offset,
      );
      allNodes.push(...nodes);
      allEdges.push(...edges);
      offset += width + 0.5; // gap between trees
    }

    return { nodes: allNodes, edges: allEdges };
  }, [state.parent]);

  const nodeMap = useMemo(() => {
    const map = new Map<number, LayoutNode>();
    for (const n of forestLayout.nodes) map.set(n.id, n);
    return map;
  }, [forestLayout.nodes]);

  if (state.parent.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-12 font-mono text-sm text-text-muted",
          className,
        )}
      >
        Union-Find not initialized
      </div>
    );
  }

  const maxX =
    Math.max(...forestLayout.nodes.map((n) => n.x), 0) * H_SPACING + H_SPACING;
  const maxY =
    Math.max(...forestLayout.nodes.map((n) => n.y), 0) * V_SPACING + V_SPACING;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="font-mono text-[10px] text-text-muted">
        {state.count} disjoint set(s) · {state.parent.length} elements
      </div>
      <div className="relative overflow-auto">
        <div
          className="relative"
          style={{
            width: maxX + NODE_R * 2,
            height: maxY + NODE_R * 2,
            minWidth: "100%",
          }}
        >
          {/* Edges */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={maxX + NODE_R * 2}
            height={maxY + NODE_R * 2}
          >
            {forestLayout.edges.map(([from, to]) => {
              const fNode = nodeMap.get(from);
              const tNode = nodeMap.get(to);
              if (!fNode || !tNode) return null;
              const key = `${from}-${to}`;
              const isHighlighted = edgeSet.has(key);
              return (
                <motion.line
                  key={key}
                  x1={fNode.x * H_SPACING + NODE_R}
                  y1={fNode.y * V_SPACING + NODE_R * 2}
                  x2={tNode.x * H_SPACING + NODE_R}
                  y2={tNode.y * V_SPACING}
                  className={cn(
                    "stroke-current",
                    isHighlighted ? "text-accent-green" : "text-zinc-600",
                  )}
                  strokeWidth={isHighlighted ? 2 : 1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {forestLayout.nodes.map((node) => {
            const isHighlighted = highlightSet.has(String(node.id));
            const isRoot = state.parent[node.id] === node.id;
            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 300, damping: 25 }
                }
                className={cn(
                  "absolute flex items-center justify-center rounded-full border font-mono text-xs",
                  isHighlighted
                    ? "border-accent-green bg-accent-green/20 text-accent-green shadow-[0_0_12px_var(--color-accent-green)/20%]"
                    : isRoot
                      ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300",
                )}
                style={{
                  width: NODE_R * 2,
                  height: NODE_R * 2,
                  left: node.x * H_SPACING,
                  top: node.y * V_SPACING,
                }}
              >
                {node.id}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Parent/rank arrays */}
      <div className="mt-2 flex gap-4 font-mono text-[10px] text-text-muted">
        <div>parent: [{state.parent.join(", ")}]</div>
        <div>rank: [{state.rank.join(", ")}]</div>
      </div>
    </div>
  );
}
