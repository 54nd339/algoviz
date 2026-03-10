"use client";

import { Circle, Line } from "@visx/shape";

import { getClassColors } from "@/components/visualizers/ai/scatter-plot";
import type { DataPoint } from "@/lib/algorithms/ai";
import { PALETTE } from "@/lib/utils/theme-colors";

type NumericScale = (value: number) => number;

interface KMeansOverlayProps {
  centroids: DataPoint[];
  points: DataPoint[];
  assignments: number[];
  xScale: NumericScale;
  yScale: NumericScale;
  innerWidth: number;
  innerHeight: number;
}

/** Draws centroid markers and point-to-centroid assignment lines. */
export function KMeansOverlay({
  centroids,
  points,
  assignments,
  xScale,
  yScale,
}: KMeansOverlayProps) {
  const classColors = getClassColors();
  return (
    <g>
      {points.map((p, i) => {
        const c = centroids[assignments[i]];
        if (!c) return null;
        return (
          <Line
            key={`l-${i}`}
            from={{ x: xScale(p.x), y: yScale(p.y) }}
            to={{ x: xScale(c.x), y: yScale(c.y) }}
            stroke={classColors[assignments[i] % classColors.length]}
            strokeWidth={0.5}
            strokeOpacity={0.2}
          />
        );
      })}
      {centroids.map((c, i) => (
        <g key={`c-${i}`}>
          <Circle
            cx={xScale(c.x)}
            cy={yScale(c.y)}
            r={8}
            fill={classColors[i % classColors.length]}
            fillOpacity={0.3}
            stroke={classColors[i % classColors.length]}
            strokeWidth={2}
          />
          <text
            x={xScale(c.x)}
            y={yScale(c.y)}
            textAnchor="middle"
            dominantBaseline="central"
            fill={PALETTE.white}
            fontSize={9}
            className="font-mono"
          >
            C{i}
          </text>
        </g>
      ))}
    </g>
  );
}
