"use client";

import { useRef } from "react";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { GeometryStep } from "@/lib/algorithms/geometry";
import { cn } from "@/lib/utils";
import { getThemeColors, PALETTE } from "@/lib/utils/theme-colors";
import { useCanvasResize } from "@/hooks/use-canvas-resize";
import type { AlgorithmStep } from "@/types";

interface GeometryCanvasProps {
  step: AlgorithmStep<GeometryStep> | null;
  className?: string;
}

const SVG_W = 600;
const SVG_H = 500;

export function GeometryCanvas({ step, className }: GeometryCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useCanvasResize(containerRef);
  const theme = getThemeColors();

  const data = step?.data;

  if (!data) {
    return (
      <EmptyCanvasState
        ref={containerRef}
        message="Select a geometry algorithm and press play"
        className={cn("h-[400px]", className)}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-bg-primary/50",
        className,
      )}
      data-tour="canvas"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        minHeight: 400,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block"
      >
        {/* Voronoi edges */}
        {data.voronoiEdges?.map((e, i) => (
          <line
            key={`ve-${i}`}
            x1={e.p1.x}
            y1={e.p1.y}
            x2={e.p2.x}
            y2={e.p2.y}
            stroke={PALETTE.accentCyanLight}
            strokeWidth={1}
            opacity={0.35}
          />
        ))}

        {/* Segments (for sweep line) */}
        {data.segments?.map((seg) => {
          const isActive = data.activeSegments?.some((a) => a.id === seg.id);
          return (
            <line
              key={`seg-${seg.id}`}
              x1={seg.p1.x}
              y1={seg.p1.y}
              x2={seg.p2.x}
              y2={seg.p2.y}
              stroke={isActive ? PALETTE.accentCyanLight : theme.textMuted}
              strokeWidth={isActive ? 2 : 1.5}
              opacity={isActive ? 1 : 0.6}
            />
          );
        })}

        {/* Hull edges (drawn as connected path) */}
        {data.hull && data.hull.length >= 2 && (
          <>
            {data.hull.map((p, i) => {
              const next = data.hull![(i + 1) % data.hull!.length];
              return (
                <line
                  key={`hull-${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={theme.accentGreen}
                  strokeWidth={2}
                  opacity={0.8}
                />
              );
            })}
          </>
        )}

        {/* Candidate edge */}
        {data.currentEdge && (
          <line
            x1={data.currentEdge[0].x}
            y1={data.currentEdge[0].y}
            x2={data.currentEdge[1].x}
            y2={data.currentEdge[1].y}
            stroke={PALETTE.accentAmberLight}
            strokeWidth={2}
            strokeDasharray="6 3"
            opacity={0.8}
          />
        )}

        {/* Sweep line */}
        {data.sweepLineX !== undefined && (
          <line
            x1={data.sweepLineX}
            y1={0}
            x2={data.sweepLineX}
            y2={SVG_H}
            stroke={PALETTE.accentPurple}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={0.7}
          />
        )}

        {/* Intersection points */}
        {data.intersections?.map((p, i) => (
          <g key={`ix-${i}`}>
            <circle cx={p.x} cy={p.y} r={5} fill={theme.accentRed} opacity={0.8} />
            <circle
              cx={p.x}
              cy={p.y}
              r={8}
              fill="none"
              stroke={theme.accentRed}
              strokeWidth={1}
              opacity={0.4}
            />
          </g>
        ))}

        {/* Points */}
        {(data.points ?? []).map((p) => {
          const isCandidate = data.candidatePoint?.id === p.id;
          const isAnchor = data.anchorPoint?.id === p.id;
          const isOnHull = (data.hull ?? []).some((h) => h.id === p.id);
          const isInStack = (data.stackPoints ?? []).some((s) => s.id === p.id);

          let fill = theme.textMuted;
          let r = 5;
          if (isCandidate) {
            fill = PALETTE.accentAmberLight;
            r = 7;
          } else if (isAnchor) {
            fill = PALETTE.accentPurple;
            r = 7;
          } else if (isOnHull || isInStack) {
            fill = theme.accentGreen;
            r = 6;
          } else {
            fill = PALETTE.accentCyanLight;
          }

          return (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r={r} fill={fill} opacity={0.9} />
              <text
                x={p.x}
                y={p.y - r - 4}
                textAnchor="middle"
                fill={theme.textSecondary}
                fontSize={9}
                className="font-mono"
              >
                {p.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Message overlay */}
      {data.message && (
        <div className="absolute bottom-2 left-2 rounded border border-border bg-bg-primary/80 px-2 py-1 font-mono text-[10px] text-text-muted">
          {data.message}
        </div>
      )}
    </div>
  );
}
