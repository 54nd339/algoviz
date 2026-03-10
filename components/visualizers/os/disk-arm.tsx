"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { DiskStep } from "@/lib/algorithms/os";
import { cn } from "@/lib/utils";
import { PALETTE } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

interface DiskArmProps {
  step: AlgorithmStep<DiskStep> | null;
  className?: string;
}

export function DiskArm({ step, className }: DiskArmProps) {
  const reducedMotion = useReducedMotion();
  const d = step?.data;
  if (!d || !Array.isArray(d.seekSequence) || !Array.isArray(d.requestQueue)) {
    return (
      <EmptyCanvasState
        message="Select a disk scheduling algorithm and press play"
        className={className}
      />
    );
  }

  const {
    currentPosition,
    requestQueue,
    servedRequests,
    seekSequence,
    totalHeadMovement,
    diskSize,
    servicing,
  } = d;

  const chartHeight = 300;
  const chartWidth = Math.max(400, seekSequence.length * 50);
  const padding = { top: 20, bottom: 30, left: 40, right: 20 };
  const innerH = chartHeight - padding.top - padding.bottom;
  const innerW = chartWidth - padding.left - padding.right;

  const yScale = (cyl: number) => padding.top + (cyl / diskSize) * innerH;
  const xScale = (i: number) =>
    padding.left + (i / Math.max(seekSequence.length - 1, 1)) * innerW;

  const pathD = seekSequence
    .map((cyl, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(cyl)}`)
    .join(" ");

  const allRequests = [...new Set([...servedRequests, ...requestQueue])];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-text-muted">
          Head: {currentPosition} | Servicing: {servicing} | Direction:{" "}
          {step.data.direction}
        </span>
        <span className="font-mono text-xs text-accent-green">
          Total Movement: {totalHeadMovement}
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="rounded border border-border bg-zinc-900/50"
        >
          {/* Cylinder axis labels */}
          {[0, 50, 100, 150, 200]
            .filter((v) => v <= diskSize)
            .map((cyl) => (
              <g key={cyl}>
                <line
                  x1={padding.left - 5}
                  y1={yScale(cyl)}
                  x2={chartWidth - padding.right}
                  y2={yScale(cyl)}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  strokeDasharray="2,4"
                />
                <text
                  x={padding.left - 8}
                  y={yScale(cyl) + 3}
                  textAnchor="end"
                  className={cn("font-mono fill-text-muted")}
                  fontSize={9}
                >
                  {cyl}
                </text>
              </g>
            ))}

          {/* Request markers on cylinder axis */}
          {allRequests.map((req) => (
            <circle
              key={`req-${req}`}
              cx={padding.left - 15}
              cy={yScale(req)}
              r={3}
              className={
                servedRequests.includes(req)
                  ? "fill-green-500"
                  : "fill-zinc-500"
              }
            />
          ))}

          {/* Seek path */}
          {seekSequence.length > 1 && (
            <motion.path
              d={pathD}
              fill="none"
              stroke={PALETTE.accentGreenHsl}
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.5 }}
            />
          )}

          {/* Points on path */}
          {seekSequence.map((cyl, i) => (
            <circle
              key={`pt-${i}`}
              cx={xScale(i)}
              cy={yScale(cyl)}
              r={i === seekSequence.length - 1 ? 5 : 3}
              className={
                i === seekSequence.length - 1
                  ? "fill-accent-green"
                  : "fill-cyan-400"
              }
            />
          ))}

          {/* Step labels */}
          {seekSequence.map((cyl, i) => (
            <text
              key={`lbl-${i}`}
              x={xScale(i)}
              y={chartHeight - 5}
              textAnchor="middle"
              fontSize={8}
              className={cn("font-mono fill-text-muted")}
            >
              {cyl}
            </text>
          ))}
        </svg>
      </div>

      {/* Pending Queue */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 font-mono text-xs text-text-muted">
          Pending:
        </span>
        {requestQueue.map((r) => (
          <span
            key={r}
            className="rounded border border-border bg-zinc-800 px-2 py-0.5 font-mono text-xs"
          >
            {r}
          </span>
        ))}
        {requestQueue.length === 0 && (
          <span className="font-mono text-xs text-text-muted">none</span>
        )}
      </div>
    </div>
  );
}
