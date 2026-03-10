"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle, Line, LinePath } from "@visx/shape";

import type { NumericalStep } from "@/lib/algorithms/numerical";
import { cn } from "@/lib/utils";
import {
  generateCurveData,
  resolveNumericalFunction,
} from "@/lib/utils/function-plot-data";
import {
  getThemeColors,
  MONO_FONT_FAMILY,
  PALETTE,
} from "@/lib/utils/theme-colors";

const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

interface FunctionPlotProps {
  step: NumericalStep | null;
  algorithmId: string;
  className?: string;
}

export function FunctionPlot({
  step,
  algorithmId,
  className,
}: FunctionPlotProps) {
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

  const func = useMemo(
    () => resolveNumericalFunction(step, algorithmId),
    [step, algorithmId],
  );

  const curveData = useMemo(
    () =>
      generateCurveData(func.fn, func.domain[0], func.domain[1], 300),
    [func],
  );

  const yValues = curveData.map((p) => p.y);
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues, 0);
  const yPad = (yMax - yMin) * 0.15 || 1;

  const xScale = useMemo(
    () => scaleLinear<number>({ domain: func.domain, range: [0, innerWidth] }),
    [func, innerWidth],
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [yMin - yPad, yMax + yPad],
        range: [innerHeight, 0],
      }),
    [yMin, yMax, yPad, innerHeight],
  );

  const tangent = step?.tangentLine;
  const interval = step?.interval;
  const trapezoids = step?.trapezoids;
  const theme = getThemeColors();

  return (
    <div
      ref={containerCallback}
      className={cn("relative h-full min-h-[300px] w-full", className)}
      data-tour="canvas"
    >
      <svg width={width} height={height}>
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

          {/* X-axis zero line */}
          <Line
            from={{ x: 0, y: yScale(0) }}
            to={{ x: innerWidth, y: yScale(0) }}
            stroke={PALETTE.strokeMuted}
            strokeWidth={1}
          />

          <AxisBottom
            top={innerHeight}
            scale={xScale}
            numTicks={8}
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

          {/* Integration trapezoids */}
          {trapezoids?.map((trap, i) => (
            <polygon
              key={`trap-${i}`}
              points={[
                `${xScale(trap.x0)},${yScale(0)}`,
                `${xScale(trap.x0)},${yScale(trap.y0)}`,
                `${xScale(trap.x1)},${yScale(trap.y1)}`,
                `${xScale(trap.x1)},${yScale(0)}`,
              ].join(" ")}
              fill={theme.accentGreen}
              fillOpacity={0.15}
              stroke={theme.accentGreen}
              strokeWidth={0.5}
              strokeOpacity={0.5}
            />
          ))}

          {/* Bisection interval shading */}
          {interval && (
            <rect
              x={xScale(interval[0])}
              y={0}
              width={xScale(interval[1]) - xScale(interval[0])}
              height={innerHeight}
              fill={theme.accentAmber}
              fillOpacity={0.08}
              stroke={theme.accentAmber}
              strokeWidth={1}
              strokeOpacity={0.3}
              strokeDasharray="4,3"
            />
          )}

          {/* Function curve */}
          <LinePath
            data={curveData}
            x={(d) => xScale(d.x)}
            y={(d) => yScale(d.y)}
            stroke={theme.accentCyan}
            strokeWidth={2}
          />

          {/* Newton's tangent line */}
          {tangent && (
            <LinePath
              data={[
                {
                  x: func.domain[0],
                  y: tangent.m * func.domain[0] + tangent.b,
                },
                {
                  x: func.domain[1],
                  y: tangent.m * func.domain[1] + tangent.b,
                },
              ]}
              x={(d) => xScale(d.x)}
              y={(d) => yScale(d.y)}
              stroke={PALETTE.accentRose}
              strokeWidth={1.5}
              strokeDasharray="6,3"
            />
          )}

          {/* Current point */}
          {step && step.x !== undefined && (
            <Circle
              cx={xScale(step.x)}
              cy={yScale(step.fx)}
              r={6}
              fill={theme.accentGreen}
              stroke={PALETTE.white}
              strokeWidth={2}
            />
          )}

          {/* Bisection midpoint marker */}
          {interval && step && (
            <>
              <Line
                from={{ x: xScale(step.x), y: 0 }}
                to={{ x: xScale(step.x), y: innerHeight }}
                stroke={theme.accentGreen}
                strokeWidth={1}
                strokeDasharray="3,3"
                strokeOpacity={0.5}
              />
            </>
          )}
        </Group>
      </svg>

      {/* Metrics overlay */}
      {step && (
        <div className="absolute top-3 right-3 rounded border border-border bg-zinc-900/80 px-2 py-1 font-mono text-[10px] text-text-muted">
          <div>x = {step.x.toFixed(8)}</div>
          <div>f(x) = {step.fx.toFixed(8)}</div>
          {step.area !== undefined && <div>Area ≈ {step.area.toFixed(6)}</div>}
          <div>Iter: {step.iteration}</div>
        </div>
      )}
    </div>
  );
}
