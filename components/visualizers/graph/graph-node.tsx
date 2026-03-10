"use client";

import { memo } from "react";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";

import { PALETTE } from "@/lib/utils/theme-colors";

const SCC_COLORS = [
  PALETTE.accentGreenLight,
  PALETTE.accentCyanLight,
  PALETTE.accentAmberLight,
  PALETTE.accentA855,
  PALETTE.accentRedLight,
  PALETTE.accentPink,
  PALETTE.accentTeal,
  PALETTE.accentOrange,
];

export type GraphNodeData = {
  label: string;
  state: "unvisited" | "active" | "visited" | "source" | "processing";
  distance?: number;
  sccGroup?: number;
  topoOrder?: number;
};

type GraphNodeType = Node<GraphNodeData, "graphNode">;

const stateStyles: Record<
  string,
  { bg: string; border: string; shadow: string }
> = {
  unvisited: {
    bg: "bg-zinc-800",
    border: "border-zinc-600",
    shadow: "",
  },
  active: {
    bg: "bg-cyan-950",
    border: "border-cyan-400",
    shadow: "shadow-[0_0_12px_rgba(6,182,212,0.3)]",
  },
  visited: {
    bg: "bg-green-950",
    border: "border-green-400",
    shadow: "shadow-[0_0_8px_rgba(34,197,94,0.2)]",
  },
  source: {
    bg: "bg-amber-950",
    border: "border-amber-400",
    shadow: "shadow-[0_0_12px_rgba(245,158,11,0.3)]",
  },
  processing: {
    bg: "bg-violet-950",
    border: "border-violet-400",
    shadow: "shadow-[0_0_12px_rgba(168,85,247,0.3)]",
  },
};

function GraphNodeComponent({ data, selected }: NodeProps<GraphNodeType>) {
  const state = data.state ?? "unvisited";
  const style = stateStyles[state] ?? stateStyles.unvisited;

  const sccColor =
    data.sccGroup !== undefined
      ? SCC_COLORS[data.sccGroup % SCC_COLORS.length]
      : undefined;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-zinc-400 !bg-zinc-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-zinc-400 !bg-zinc-500"
      />

      <div
        className={`flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 font-mono text-sm font-bold text-zinc-100 transition-all duration-200 ${style.bg} ${style.border} ${style.shadow} ${selected ? "ring-2 ring-white/40" : ""} `}
        style={
          sccColor
            ? { borderColor: sccColor, boxShadow: `0 0 12px ${sccColor}40` }
            : undefined
        }
      >
        {data.label}
      </div>

      {data.distance !== undefined && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap text-zinc-400">
          {data.distance === Infinity ? "∞" : data.distance}
        </div>
      )}

      {data.topoOrder !== undefined && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap text-amber-400">
          #{data.topoOrder}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-zinc-400 !bg-zinc-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-zinc-400 !bg-zinc-500"
      />
    </>
  );
}

export const GraphNode = memo(GraphNodeComponent);
