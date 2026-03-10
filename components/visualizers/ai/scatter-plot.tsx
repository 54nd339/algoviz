"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle } from "@visx/shape";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";

import type { DataPoint } from "@/lib/algorithms/ai";
import { cn } from "@/lib/utils";
import {
  getThemeColors,
  MONO_FONT_FAMILY,
  PALETTE,
} from "@/lib/utils/theme-colors";

const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

function getClassColors() {
  const theme = getThemeColors();
  return [
    theme.accentCyan,
    theme.accentAmber,
    theme.accentGreen,
    PALETTE.accentPink,
    PALETTE.accentViolet,
  ];
}

export interface ScatterScales {
  xScale: ReturnType<typeof scaleLinear<number>>;
  yScale: ReturnType<typeof scaleLinear<number>>;
  innerWidth: number;
  innerHeight: number;
}

interface ScatterPlotProps {
  points: DataPoint[];
  highlightIndices?: number[];
  queryPoint?: DataPoint;
  /** When set (e.g. K-Means), color each point by cluster index instead of point.class */
  clusterAssignments?: number[];
  className?: string;
  onClickCanvas?: (point: DataPoint) => void;
  renderOverlay?: (scales: ScatterScales) => React.ReactNode;
}

export function ScatterPlot({
  points,
  highlightIndices,
  queryPoint,
  clusterAssignments,
  className,
  onClickCanvas,
  renderOverlay,
}: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 400 });

  const resizeObserver = useRef<ResizeObserver | null>(null);
  const containerCallback = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserver.current) resizeObserver.current.disconnect();
    if (!node) return;
    containerRef.current = node;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    obs.observe(node);
    resizeObserver.current = obs;
  }, []);

  const { width, height } = size;
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const [xDomain, yDomain] = useMemo(() => {
    if (points.length === 0)
      return [
        [0, 100],
        [0, 100],
      ];
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const pad = 5;
    return [
      [Math.min(...xs) - pad, Math.max(...xs) + pad],
      [Math.min(...ys) - pad, Math.max(...ys) + pad],
    ];
  }, [points]);

  const xScale = useMemo(
    () => scaleLinear<number>({ domain: xDomain, range: [0, innerWidth] }),
    [xDomain, innerWidth],
  );
  const yScale = useMemo(
    () => scaleLinear<number>({ domain: yDomain, range: [innerHeight, 0] }),
    [yDomain, innerHeight],
  );

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<DataPoint>();

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!onClickCanvas) return;
      const svg = e.currentTarget;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      const x = xScale.invert(svgP.x - MARGIN.left);
      const y = yScale.invert(svgP.y - MARGIN.top);
      onClickCanvas({ x, y });
    },
    [onClickCanvas, xScale, yScale],
  );

  const highlightSet = useMemo(
    () => new Set(highlightIndices ?? []),
    [highlightIndices],
  );

  const theme = getThemeColors();
  const classColors = getClassColors();

  return (
    <div
      ref={containerCallback}
      className={cn("relative h-full min-h-[300px] w-full", className)}
      data-tour="canvas"
    >
      <svg
        width={width}
        height={height}
        onClick={handleSvgClick}
        className="cursor-crosshair"
      >
        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows
            scale={yScale}
            width={innerWidth}
            stroke={PALETTE.gridLineMuted}
            strokeDasharray="2,3"
          />
          <GridColumns
            scale={xScale}
            height={innerHeight}
            stroke={PALETTE.gridLineMuted}
            strokeDasharray="2,3"
          />

          <AxisBottom
            top={innerHeight}
            scale={xScale}
            numTicks={6}
            stroke={PALETTE.strokeMuted}
            tickStroke={PALETTE.strokeMuted}
            tickLabelProps={() => ({
              fill: theme.textSecondary,
              fontSize: 10,
              fontFamily: MONO_FONT_FAMILY,
              textAnchor: "middle" as const,
            })}
          />
          <AxisLeft
            scale={yScale}
            numTicks={6}
            stroke={PALETTE.strokeMuted}
            tickStroke={PALETTE.strokeMuted}
            tickLabelProps={() => ({
              fill: theme.textSecondary,
              fontSize: 10,
              fontFamily: MONO_FONT_FAMILY,
              textAnchor: "end" as const,
              dx: -4,
              dy: 3,
            })}
          />

          {/* Overlay content (regression line, decision boundary, etc.) */}
          {renderOverlay?.({ xScale, yScale, innerWidth, innerHeight })}

          {/* Data points */}
          {points.map((point, i) => {
            const cx = xScale(point.x);
            const cy = yScale(point.y);
            const color =
              clusterAssignments != null
                ? classColors[clusterAssignments[i] % classColors.length]
                : (classColors[point.class ?? 0] ?? classColors[0]);
            const isHighlighted = highlightSet.has(i);
            return (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={isHighlighted ? 6 : 4}
                fill={color}
                opacity={isHighlighted ? 1 : 0.8}
                stroke={isHighlighted ? PALETTE.white : "none"}
                strokeWidth={isHighlighted ? 1.5 : 0}
                onMouseEnter={() =>
                  showTooltip({
                    tooltipData: point,
                    tooltipLeft: cx + MARGIN.left,
                    tooltipTop: cy + MARGIN.top,
                  })
                }
                onMouseLeave={hideTooltip}
                className="transition-all duration-150"
              />
            );
          })}

          {/* Query point */}
          {queryPoint && (
            <Circle
              cx={xScale(queryPoint.x)}
              cy={yScale(queryPoint.y)}
              r={7}
              fill="none"
              stroke={PALETTE.accentRose}
              strokeWidth={2.5}
              strokeDasharray="3,2"
            />
          )}
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          left={tooltipLeft}
          top={tooltipTop}
          className="!rounded !border-zinc-700 !bg-zinc-800 !px-2 !py-1 !font-mono !text-[10px] !text-zinc-200"
        >
          ({tooltipData.x.toFixed(1)}, {tooltipData.y.toFixed(1)})
          {tooltipData.class !== undefined && ` class: ${tooltipData.class}`}
        </TooltipWithBounds>
      )}
    </div>
  );
}

export { getClassColors, MARGIN };
export type { ScatterPlotProps };
