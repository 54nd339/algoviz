"use client";

import { memo } from "react";
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getStraightPath,
  useStore,
} from "@xyflow/react";

import { PALETTE } from "@/lib/utils/theme-colors";

export type GraphEdgeData = {
  weight?: number;
  state: "default" | "examining" | "accepted" | "rejected";
  directed?: boolean;
  animated?: boolean;
};

type GraphEdgeType = Edge<GraphEdgeData, "graphEdge">;

const stateColors: Record<string, string> = {
  default: PALETTE.strokeMuted,
  examining: PALETTE.accentCyanLight,
  accepted: PALETTE.accentGreenLight,
  rejected: PALETTE.accentRedLight,
};

const NODE_SIZE = 48;
const NODE_HALF = NODE_SIZE / 2;

function GraphEdgeComponent({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<GraphEdgeType>) {
  const state = data?.state ?? "default";
  const color = stateColors[state] ?? stateColors.default;
  const directed = data?.directed ?? false;
  const animated = data?.animated ?? state === "examining";

  const nodeCenters = useStore((s) => {
    const src = s.nodes.find((n) => n.id === source);
    const tgt = s.nodes.find((n) => n.id === target);
    if (!src?.position || !tgt?.position) return null;
    return {
      sourceX: src.position.x + NODE_HALF,
      sourceY: src.position.y + NODE_HALF,
      targetX: tgt.position.x + NODE_HALF,
      targetY: tgt.position.y + NODE_HALF,
    };
  });

  const [edgePath, labelX, labelY] =
    nodeCenters != null
      ? getStraightPath({
          sourceX: nodeCenters.sourceX,
          sourceY: nodeCenters.sourceY,
          targetX: nodeCenters.targetX,
          targetY: nodeCenters.targetY,
        })
      : getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: state === "default" ? 2 : 3,
          transition: "stroke 0.2s, stroke-width 0.2s",
        }}
        markerEnd={directed ? `url(#marker-${state})` : undefined}
        className={animated ? "animate-pulse" : ""}
      />

      {data?.weight !== undefined && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-auto absolute rounded border border-zinc-700 bg-zinc-900/90 px-1.5 py-0.5 font-mono text-xs text-zinc-300"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {data.weight}
          </div>
        </EdgeLabelRenderer>
      )}

      <defs>
        <marker
          id={`marker-${state}`}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
    </>
  );
}

export const GraphEdge = memo(GraphEdgeComponent);
