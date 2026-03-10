"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { DPStep } from "@/lib/algorithms/dp";
import { cn } from "@/lib/utils";
import { getThemeColors, PALETTE } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

interface DPTableProps {
  step: AlgorithmStep<DPStep> | null;
  className?: string;
}

const CELL_SIZE = 44;
const HEADER_WIDTH = 80;
const HEADER_HEIGHT = 32;

export function DPTable({ step, className }: DPTableProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const data = step?.data;

  if (!data) {
    return <EmptyCanvasState className={cn("h-64", className)} />;
  }

  const {
    table,
    rowHeaders,
    colHeaders,
    subproblemLabel,
    dependencies,
    currentCell,
  } = data;
  const rows = table.length;
  const cols = table[0]?.length ?? 0;
  const theme = getThemeColors();

  const svgWidth = HEADER_WIDTH + cols * CELL_SIZE;
  const svgHeight = HEADER_HEIGHT + rows * CELL_SIZE;

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col gap-2 overflow-auto", className)}
      data-tour="canvas"
    >
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

      <div className="relative overflow-auto rounded-lg border border-border bg-bg-primary/50 p-2">
        <svg width={svgWidth} height={svgHeight} className="block">
          {/* Column headers */}
          {colHeaders?.map((h, j) => (
            <text
              key={`ch-${j}`}
              x={HEADER_WIDTH + j * CELL_SIZE + CELL_SIZE / 2}
              y={HEADER_HEIGHT / 2 + 4}
              textAnchor="middle"
              className="fill-text-muted font-mono"
              fontSize={10}
            >
              {h}
            </text>
          ))}

          {/* Row headers */}
          {rowHeaders?.map((h, i) => (
            <text
              key={`rh-${i}`}
              x={HEADER_WIDTH - 6}
              y={HEADER_HEIGHT + i * CELL_SIZE + CELL_SIZE / 2 + 4}
              textAnchor="end"
              className="fill-text-muted font-mono"
              fontSize={9}
            >
              {h.length > 12 ? h.slice(0, 12) + "…" : h}
            </text>
          ))}

          {/* Cells */}
          {table.map((row, i) =>
            row.map((cell, j) => {
              const x = HEADER_WIDTH + j * CELL_SIZE;
              const y = HEADER_HEIGHT + i * CELL_SIZE;

              const isFilled = cell !== null;
              const isCurrent = currentCell[0] === i && currentCell[1] === j;
              const isDep = dependencies.some(([r, c]) => r === i && c === j);
              const isBacktrack = data.backtrackPath?.some(
                ([r, c]) => r === i && c === j,
              );

              let fillColor = `${theme.bgElevated}80`;
              if (isBacktrack) fillColor = `${PALETTE.accentPurple}30`;
              else if (isCurrent) fillColor = `${PALETTE.accentAmberLight}30`;
              else if (isDep) fillColor = `${PALETTE.accentCyanLight}30`;
              else if (isFilled) fillColor = `${theme.accentGreen}10`;

              let strokeColor: string = PALETTE.strokeDefault;
              if (isBacktrack) strokeColor = PALETTE.accentPurple;
              else if (isCurrent) strokeColor = PALETTE.accentAmberLight;
              else if (isDep) strokeColor = PALETTE.accentCyanLight;
              else if (isFilled) strokeColor = `${theme.accentGreen}66`;

              return (
                <g key={`${i}-${j}`}>
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width={CELL_SIZE - 2}
                    height={CELL_SIZE - 2}
                    rx={4}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isCurrent || isDep || isBacktrack ? 1.5 : 0.5}
                  />
                  {cell !== null && (
                    <text
                      x={x + CELL_SIZE / 2}
                      y={y + CELL_SIZE / 2 + 4}
                      textAnchor="middle"
                      className="fill-text-primary font-mono"
                      fontSize={11}
                      fontWeight={isCurrent ? 700 : 400}
                    >
                      {cell === Infinity ? "∞" : cell}
                    </text>
                  )}
                </g>
              );
            }),
          )}

          {/* Dependency arrows */}
          <DependencyArrows
            dependencies={dependencies}
            currentCell={currentCell}
            headerWidth={HEADER_WIDTH}
            headerHeight={HEADER_HEIGHT}
            cellSize={CELL_SIZE}
          />
        </svg>
      </div>
    </div>
  );
}

function DependencyArrows({
  dependencies,
  currentCell,
  headerWidth,
  headerHeight,
  cellSize,
}: {
  dependencies: [number, number][];
  currentCell: [number, number];
  headerWidth: number;
  headerHeight: number;
  cellSize: number;
}) {
  if (dependencies.length === 0) return null;

  const cx = headerWidth + currentCell[1] * cellSize + cellSize / 2;
  const cy = headerHeight + currentCell[0] * cellSize + cellSize / 2;

  return (
    <>
      <defs>
        <marker
          id="dp-arrow"
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
      {dependencies.map(([r, c], idx) => {
        const dx = headerWidth + c * cellSize + cellSize / 2;
        const dy = headerHeight + r * cellSize + cellSize / 2;

        return (
          <line
            key={idx}
            x1={dx}
            y1={dy}
            x2={cx}
            y2={cy}
            stroke={PALETTE.accentCyanLight}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            markerEnd="url(#dp-arrow)"
            opacity={0.6}
          />
        );
      })}
    </>
  );
}
