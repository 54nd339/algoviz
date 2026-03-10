"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { FibStep } from "@/lib/algorithms/dp";
import { cn } from "@/lib/utils";
import { getThemeColors, PALETTE } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

interface DPTable1DProps {
  step: AlgorithmStep<FibStep> | null;
  className?: string;
}

const CELL_W = 52;
const CELL_H = 44;

export function DPTable1D({ step, className }: DPTable1DProps) {
  const reducedMotion = useReducedMotion();
  const data = step?.data;

  if (!data) {
    return <EmptyCanvasState className={cn("h-40", className)} />;
  }

  const { table, subproblemLabel, dependencies, currentIndex } = data;
  const theme = getThemeColors();

  const svgWidth = table.length * CELL_W + 20;
  const svgHeight = CELL_H + 50;

  return (
    <div className={cn("flex flex-col gap-2 overflow-auto", className)}>
      {subproblemLabel && (
        <motion.div
          key={subproblemLabel}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
          className="self-start rounded border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 font-mono text-xs text-amber-400"
        >
          {subproblemLabel}
        </motion.div>
      )}

      <div className="relative overflow-auto rounded-lg border border-border bg-bg-primary/50 p-3">
        <svg width={svgWidth} height={svgHeight} className="block">
          {/* Index labels */}
          {table.map((_, i) => (
            <text
              key={`idx-${i}`}
              x={10 + i * CELL_W + CELL_W / 2}
              y={14}
              textAnchor="middle"
              className="fill-text-muted font-mono"
              fontSize={10}
            >
              {i}
            </text>
          ))}

          {/* Cells */}
          {table.map((cell, i) => {
            const x = 10 + i * CELL_W;
            const y = 22;
            const isCurrent = currentIndex === i;
            const isDep = dependencies?.includes(i) ?? false;
            const isFilled = cell !== null;

            let fillColor = `${theme.bgElevated}80`;
            if (isCurrent) fillColor = `${PALETTE.accentAmberLight}20`;
            else if (isDep) fillColor = `${PALETTE.accentCyanLight}20`;
            else if (isFilled) fillColor = `${theme.accentGreen}10`;

            let strokeColor: string = PALETTE.strokeDefault;
            if (isCurrent) strokeColor = PALETTE.accentAmberLight;
            else if (isDep) strokeColor = PALETTE.accentCyanLight;
            else if (isFilled) strokeColor = `${theme.accentGreen}66`;

            return (
              <g key={i}>
                <rect
                  x={x + 1}
                  y={y}
                  width={CELL_W - 2}
                  height={CELL_H}
                  rx={4}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isCurrent || isDep ? 1.5 : 0.5}
                />
                {cell !== null && (
                  <text
                    x={x + CELL_W / 2}
                    y={y + CELL_H / 2 + 4}
                    textAnchor="middle"
                    className="fill-text-primary font-mono"
                    fontSize={12}
                    fontWeight={isCurrent ? 700 : 400}
                  >
                    {cell === -1 ? "∞" : cell}
                  </text>
                )}
              </g>
            );
          })}

          {/* Dependency arrows */}
          {dependencies && dependencies.length > 0 && currentIndex >= 0 && (
            <>
              <defs>
                <marker
                  id="dp1d-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth={5}
                  markerHeight={5}
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={PALETTE.accentCyanLight} />
                </marker>
              </defs>
              {dependencies.map((dep, idx) => {
                const fromX = 10 + dep * CELL_W + CELL_W / 2;
                const toX = 10 + currentIndex * CELL_W + CELL_W / 2;
                const fromY = 22 + CELL_H + 4;
                const toY = fromY;
                const midY = fromY + 16;

                return (
                  <path
                    key={idx}
                    d={`M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${midY} ${toX} ${toY}`}
                    fill="none"
                    stroke={PALETTE.accentCyanLight}
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    markerEnd="url(#dp1d-arrow)"
                    opacity={0.6}
                  />
                );
              })}
            </>
          )}

          {/* Coin used label */}
          {data.coinUsed !== undefined && currentIndex >= 0 && (
            <text
              x={10 + currentIndex * CELL_W + CELL_W / 2}
              y={22 + CELL_H + 32}
              textAnchor="middle"
              className="fill-amber-400 font-mono"
              fontSize={9}
            >
              coin={data.coinUsed}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
