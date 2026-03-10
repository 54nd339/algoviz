"use client";

import { useMemo } from "react";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { FibStep } from "@/lib/algorithms/dp";
import {
  type LayoutNode,
  layoutTree,
  NODE_R,
} from "@/lib/algorithms/dp/fib-layout";
import { cn } from "@/lib/utils";
import { getThemeColors, PALETTE } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

interface FibTreeProps {
  step: AlgorithmStep<FibStep> | null;
  className?: string;
}

function renderEdges(node: LayoutNode): React.ReactNode[] {
  const edges: React.ReactNode[] = [];
  for (const child of node.children) {
    edges.push(
      <line
        key={`${node.node.value}-${node.x}-${child.node.value}-${child.x}`}
        x1={node.x}
        y1={node.y}
        x2={child.x}
        y2={child.y}
        stroke={PALETTE.strokeDefault}
        strokeWidth={1.5}
      />,
    );
    edges.push(...renderEdges(child));
  }
  return edges;
}

function renderNodes(
  node: LayoutNode,
  currentIndex: number,
  duplicateWork: number[],
  theme: ReturnType<typeof getThemeColors>,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const { node: treeNode, x, y } = node;

  const isCurrent = treeNode.value === currentIndex;
  const isDuplicate = treeNode.duplicate;

  let fill = theme.bgElevated;
  let stroke: string = PALETTE.strokeDefault;
  let textColor: string = theme.textSecondary;

  if (isCurrent) {
    fill = `${PALETTE.accentAmberLight}30`;
    stroke = PALETTE.accentAmberLight;
    textColor = PALETTE.accentAmberLight;
  } else if (isDuplicate) {
    fill = `${theme.accentRed}30`;
    stroke = theme.accentRed;
    textColor = PALETTE.redLight;
  } else if (treeNode.computed) {
    fill = `${theme.accentGreen}10`;
    stroke = `${theme.accentGreen}66`;
    textColor = PALETTE.greenLight;
  }

  nodes.push(
    <g key={`node-${treeNode.value}-${x}-${y}`}>
      <circle
        cx={x}
        cy={y}
        r={NODE_R}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={textColor}
        fontSize={11}
        className="font-mono"
        fontWeight={isCurrent ? 700 : 400}
      >
        f({treeNode.value})
      </text>
    </g>,
  );

  for (const child of node.children) {
    nodes.push(...renderNodes(child, currentIndex, duplicateWork, theme));
  }

  return nodes;
}

export function FibTree({ step, className }: FibTreeProps) {
  const data = step?.data;
  const tree = data?.recursionTree;

  const treeLayout = useMemo(() => {
    if (!tree) return null;
    return layoutTree(tree);
  }, [tree]);

  if (!data || !tree || !treeLayout) {
    return (
      <EmptyCanvasState
        message="Recursion tree will appear here in naive mode"
        className={cn("h-64", className)}
      />
    );
  }

  const { layout, width, height } = treeLayout;
  const pad = 20;

  return (
    <div
      className={cn("flex flex-col gap-2 overflow-auto", className)}
      data-tour="canvas"
    >
      <div className="flex items-center gap-3 font-mono text-[10px] text-text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full border border-red-400 bg-red-400/30" />
          Duplicate
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full border border-green-400/60 bg-green-400/10" />
          Computed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full border border-amber-400 bg-amber-400/30" />
          Current
        </span>
      </div>

      <div className="overflow-auto rounded-lg border border-border bg-bg-primary/50 p-2">
        <svg
          width={width + pad * 2}
          height={height + pad}
          viewBox={`${-pad} 0 ${width + pad * 2} ${height + pad}`}
        >
          {renderEdges(layout)}
          {renderNodes(
            layout,
            data.currentIndex,
            data.duplicateWork ?? [],
            getThemeColors(),
          )}
        </svg>
      </div>

      {data.duplicateWork && data.duplicateWork.length > 0 && (
        <div className="rounded border border-red-400/20 bg-red-400/10 px-3 py-1.5 font-mono text-xs text-red-400">
          {data.duplicateWork.length} duplicate computations so far
        </div>
      )}
    </div>
  );
}
