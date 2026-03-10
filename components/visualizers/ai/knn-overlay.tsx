"use client";

import { Circle, Line } from "@visx/shape";

import type { DataPoint } from "@/lib/algorithms/ai";
import { PALETTE } from "@/lib/utils/theme-colors";

type NumericScale = (value: number) => number;

interface KNNOverlayProps {
  queryPoint: DataPoint;
  neighbors: DataPoint[];
  distances: { point: DataPoint; distance: number }[];
  k: number;
  xScale: NumericScale;
  yScale: NumericScale;
  innerWidth: number;
  innerHeight: number;
}

/** Visualizes KNN query radius and connections to k nearest neighbors. */
export function KNNOverlay({
  queryPoint,
  neighbors,
  distances,
  xScale,
  yScale,
}: KNNOverlayProps) {
  const qx = xScale(queryPoint.x);
  const qy = yScale(queryPoint.y);
  const maxNeighborDist =
    distances.length > 0
      ? Math.max(
          ...neighbors.map((n) => {
            const d = distances.find(
              (dd) => dd.point.x === n.x && dd.point.y === n.y,
            );
            return d?.distance ?? 0;
          }),
        )
      : 0;

  const rx =
    maxNeighborDist > 0
      ? Math.abs(xScale(queryPoint.x + maxNeighborDist) - xScale(queryPoint.x))
      : 0;
  const ry =
    maxNeighborDist > 0
      ? Math.abs(yScale(queryPoint.y + maxNeighborDist) - yScale(queryPoint.y))
      : 0;

  return (
    <g>
      {maxNeighborDist > 0 && rx > 0 && ry > 0 && (
        <ellipse
          cx={qx}
          cy={qy}
          rx={rx}
          ry={ry}
          fill={PALETTE.accentRoseAlpha}
          stroke={PALETTE.accentRose}
          strokeWidth={1}
          strokeDasharray="4,3"
          strokeOpacity={0.6}
        />
      )}
      {neighbors.map((n, i) => (
        <Line
          key={i}
          from={{ x: qx, y: qy }}
          to={{ x: xScale(n.x), y: yScale(n.y) }}
          stroke={PALETTE.accentRose}
          strokeWidth={1}
          strokeOpacity={0.4}
          strokeDasharray="3,2"
        />
      ))}
      {neighbors.map((n, i) => (
        <Circle
          key={`h-${i}`}
          cx={xScale(n.x)}
          cy={yScale(n.y)}
          r={6}
          fill="none"
          stroke={PALETTE.accentRose}
          strokeWidth={2}
        />
      ))}
    </g>
  );
}
