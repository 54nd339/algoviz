"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { DSStructureState } from "@/lib/algorithms/data-structures";
import { cn } from "@/lib/utils";

interface MemoryLayoutProps {
  state: DSStructureState;
  className?: string;
}

function hexAddr(base: number, offset: number): string {
  return `0x${(base + offset * 4).toString(16).padStart(4, "0")}`;
}

function ContiguousView({
  items,
  label,
  reducedMotion,
}: {
  items: (number | string)[];
  label: string;
  reducedMotion: boolean;
}) {
  const base = 0x1000;
  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1 font-mono text-[10px] text-text-muted">
        {label} — contiguous memory
      </div>
      <div className="flex gap-px">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.3,
              delay: reducedMotion ? 0 : i * 0.03,
            }}
            className="flex flex-col items-center"
          >
            <div className="flex h-10 w-12 items-center justify-center border border-zinc-700 bg-zinc-900 font-mono text-xs text-zinc-300">
              {item}
            </div>
            <span className="mt-0.5 font-mono text-[8px] text-zinc-600">
              {hexAddr(base, i)}
            </span>
          </motion.div>
        ))}
        {items.length === 0 && (
          <span className="font-mono text-[10px] text-zinc-600">empty</span>
        )}
      </div>
    </div>
  );
}

function ScatteredView({
  nodes,
  pointers,
  label,
  reducedMotion,
}: {
  nodes: { id: string; value: string | number; addr: number }[];
  pointers: { from: number; to: number }[];
  label: string;
  reducedMotion: boolean;
}) {
  const positions = nodes.map((_, i) => ({
    x: 20 + (i % 4) * 100 + (i % 2) * 30,
    y: 10 + Math.floor(i / 4) * 70 + (i % 3) * 15,
  }));

  const width = Math.max(...positions.map((p) => p.x), 100) + 80;
  const height = Math.max(...positions.map((p) => p.y), 60) + 50;

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1 font-mono text-[10px] text-text-muted">
        {label} — scattered memory (pointer-based)
      </div>
      <div className="relative overflow-auto" style={{ width, height }}>
        <svg
          className="pointer-events-none absolute inset-0"
          width={width}
          height={height}
        >
          {pointers.map(({ from, to }, i) => {
            if (!positions[from] || !positions[to]) return null;
            return (
              <line
                key={i}
                x1={positions[from].x + 24}
                y1={positions[from].y + 14}
                x2={positions[to].x}
                y2={positions[to].y + 14}
                className="stroke-current text-zinc-600"
                strokeWidth={1}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="4"
              refX="6"
              refY="2"
              orient="auto"
            >
              <polygon
                points="0 0, 6 2, 0 4"
                className="fill-current text-zinc-600"
              />
            </marker>
          </defs>
        </svg>
        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.3,
              delay: reducedMotion ? 0 : i * 0.05,
            }}
            className="absolute flex flex-col items-center"
            style={{ left: positions[i].x, top: positions[i].y }}
          >
            <div className="flex h-7 w-12 items-center justify-center rounded border border-zinc-700 bg-zinc-900 font-mono text-[10px] text-zinc-300">
              {node.value}
            </div>
            <span className="mt-0.5 font-mono text-[7px] text-zinc-600">
              {hexAddr(0x2000 + node.addr * 8, 0)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function MemoryLayout({ state, className }: MemoryLayoutProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800 bg-zinc-950 p-3",
        className,
      )}
    >
      <div className="mb-2 font-mono text-xs text-accent-green">
        Memory Layout
      </div>

      {state.kind === "stack" && (
        <ContiguousView
          items={state.items}
          label="Stack (array-backed)"
          reducedMotion={reducedMotion ?? false}
        />
      )}

      {state.kind === "queue" && (
        <ContiguousView
          items={state.items}
          label="Queue (array-backed)"
          reducedMotion={reducedMotion ?? false}
        />
      )}

      {state.kind === "heap" && (
        <div className="flex flex-col gap-3">
          <ContiguousView
            items={state.array}
            label="Heap (array representation)"
            reducedMotion={reducedMotion ?? false}
          />
          <div className="font-mono text-[9px] text-text-muted">
            parent(i) = ⌊(i-1)/2⌋ · left(i) = 2i+1 · right(i) = 2i+2
          </div>
        </div>
      )}

      {state.kind === "linked-list" && (
        <ScatteredView
          reducedMotion={reducedMotion ?? false}
          nodes={state.nodes.map((n, i) => ({
            id: n.id,
            value: n.value,
            addr: i * 3 + (i % 2) * 7,
          }))}
          pointers={
            state.nodes
              .map((n, i) => {
                const nextIdx = state.nodes.findIndex((m) => m.id === n.next);
                return nextIdx !== -1 ? { from: i, to: nextIdx } : null;
              })
              .filter(Boolean) as { from: number; to: number }[]
          }
          label={`Linked List (${state.doubly ? "doubly" : "singly"} — heap allocated)`}
        />
      )}

      {(state.kind === "bst" ||
        state.kind === "avl" ||
        state.kind === "red-black") && (
        <ScatteredView
          reducedMotion={reducedMotion ?? false}
          nodes={flattenTree(state.root).map((n, i) => ({
            id: n.id,
            value: n.value,
            addr: i * 5 + (i % 3) * 4,
          }))}
          pointers={flattenTreeEdges(state.root)}
          label={`${state.kind.toUpperCase()} (pointer-based, heap allocated)`}
        />
      )}

      {state.kind === "hash-table" && (
        <div className="flex flex-col gap-2">
          <ContiguousView
            items={state.buckets.map((b, i) => (b ? `[${i}]✓` : `[${i}]∅`))}
            label={`Hash Table buckets (${state.mode})`}
            reducedMotion={reducedMotion ?? false}
          />
          {state.mode === "chaining" && (
            <div className="font-mono text-[9px] text-text-muted">
              Each bucket points to a linked list of entries
            </div>
          )}
        </div>
      )}

      {state.kind === "union-find" && (
        <ContiguousView
          items={state.parent}
          label="Union-Find parent array"
          reducedMotion={reducedMotion ?? false}
        />
      )}

      {(state.kind === "trie" ||
        state.kind === "b-tree" ||
        state.kind === "huffman") && (
        <div className="py-2 font-mono text-[10px] text-text-muted">
          {state.kind === "trie" &&
            "Trie: pointer-based tree with per-node child map (hash map or array of 26 for lowercase)"}
          {state.kind === "b-tree" &&
            "B-Tree: each node stores keys array + children pointers array. Often disk-block aligned."}
          {state.kind === "huffman" &&
            "Huffman tree: pointer-based binary tree. Leaf nodes store character + code."}
        </div>
      )}
    </div>
  );
}

// ── Helpers to flatten a binary tree for scattered view ──────────────────────

interface FlatNode {
  id: string;
  value: number;
}

function flattenTree(
  root: { id: string; value: number; left: unknown; right: unknown } | null,
): FlatNode[] {
  if (!root) return [];
  const result: FlatNode[] = [{ id: root.id, value: root.value }];
  result.push(...flattenTree(root.left as typeof root));
  result.push(...flattenTree(root.right as typeof root));
  return result;
}

function flattenTreeEdges(
  root: {
    id: string;
    left: { id: string } | null;
    right: { id: string } | null;
  } | null,
  nodes?: FlatNode[],
): { from: number; to: number }[] {
  if (!root) return [];
  const flat =
    nodes ??
    flattenTree(
      root as { id: string; value: number; left: unknown; right: unknown },
    );
  const idxMap = new Map(flat.map((n, i) => [n.id, i]));
  const edges: { from: number; to: number }[] = [];

  function walk(node: typeof root) {
    if (!node) return;
    const fi = idxMap.get(node.id);
    if (fi === undefined) return;
    if (node.left) {
      const ti = idxMap.get(node.left.id);
      if (ti !== undefined) edges.push({ from: fi, to: ti });
      walk(node.left as typeof root);
    }
    if (node.right) {
      const ri = idxMap.get(node.right.id);
      if (ri !== undefined) edges.push({ from: fi, to: ri });
      walk(node.right as typeof root);
    }
  }
  walk(root);
  return edges;
}
