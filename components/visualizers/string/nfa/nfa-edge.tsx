"use client";

import type { LayoutNode } from "@/lib/algorithms/string/nfa-layout";
import type { NFATransition } from "@/lib/algorithms/string/types";
import { cn } from "@/lib/utils";
import { getThemeColors } from "@/lib/utils/theme-colors";

import { getArrowPath, getSelfLoopPath } from "./nfa-graph-math";

interface NfaEdgeProps {
  transition: NFATransition;
  fromNode: LayoutNode;
  toNode: LayoutNode;
  nodeRadius: number;
}

export function NfaEdge({
  transition,
  fromNode,
  toNode,
  nodeRadius,
}: NfaEdgeProps) {
  const theme = getThemeColors();
  const isSelf = transition.from === transition.to;
  const isEpsilon = transition.symbol === null;
  const path = isSelf
    ? getSelfLoopPath(fromNode.x, fromNode.y, nodeRadius)
    : getArrowPath(
        fromNode.x,
        fromNode.y,
        toNode.x,
        toNode.y,
        nodeRadius,
      );

  const midX = isSelf ? fromNode.x : (fromNode.x + toNode.x) / 2;
  const midY = isSelf
    ? fromNode.y - nodeRadius - 28
    : (fromNode.y + toNode.y) / 2 - 10;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={isEpsilon ? theme.textMuted : theme.textSecondary}
        strokeWidth={1.5}
        strokeDasharray={isEpsilon ? "4 3" : undefined}
        markerEnd={
          isEpsilon ? "url(#arrowhead-epsilon)" : "url(#arrowhead)"
        }
      />
      <text
        x={midX}
        y={midY}
        textAnchor="middle"
        className={cn(
          "font-mono text-[10px]",
          isEpsilon ? "fill-zinc-500" : "fill-zinc-300",
        )}
      >
        {isEpsilon ? "ε" : transition.symbol}
      </text>
    </g>
  );
}
