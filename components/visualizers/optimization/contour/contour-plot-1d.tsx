"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle, LinePath } from "@visx/shape";

import { FUNCTIONS_1D } from "@/lib/algorithms/optimization";
import { cn } from "@/lib/utils";
import {
  getThemeColors,
  MONO_FONT_FAMILY,
  PALETTE,
} from "@/lib/utils/theme-colors";

import type { ContourPlotInnerProps } from "./contour-plot-shared";
import { MARGIN } from "./contour-plot-shared";

export function ContourPlot1D({
  step,
  width,
  height,
  innerWidth,
  innerHeight,
  onStartChange,
}: ContourPlotInnerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const func = useMemo(
    () =>
      FUNCTIONS_1D.find((f) => f.id === step?.functionId) ?? FUNCTIONS_1D[0],
    [step?.functionId],
  );

  const curveData = useMemo(() => {
    const [lo, hi] = func.domain;
    const points: { x: number; y: number }[] = [];
    const n = 200;
    for (let i = 0; i <= n; i++) {
      const x = lo + (i / n) * (hi - lo);
      points.push({ x, y: func.fn(x) });
    }
    return points;
  }, [func]);

  const yValues = curveData.map((p) => p.y);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const yPad = (yMax - yMin) * 0.1 || 1;

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

  const pos = step?.position;
  const population = step?.population;
  const trail = step?.trail ?? [];
  const best = step?.best;
  const theme = getThemeColors();

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!onStartChange || !pos) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    },
    [onStartChange, pos],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!onStartChange || !dragging || !svgRef.current) return;
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      const innerX = svgPt.x - MARGIN.left;
      const [xMin, xMax] = func.domain;
      const x = Math.max(xMin, Math.min(xMax, xScale.invert(innerX)));
      onStartChange(x);
    },
    [onStartChange, dragging, xScale, func.domain],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  }, []);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={cn("touch-none", dragging && "cursor-grabbing")}
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

        {/* Function curve */}
        <LinePath
          data={curveData}
          x={(d) => xScale(d.x)}
          y={(d) => yScale(d.y)}
          stroke={theme.accentCyan}
          strokeWidth={2}
        />

        {/* Trail markers */}
        {trail.map((t, i) => (
          <Circle
            key={`t-${i}`}
            cx={xScale(t.x)}
            cy={yScale(func.fn(t.x))}
            r={3}
            fill={theme.accentGreen}
            opacity={0.3 + (i / trail.length) * 0.7}
          />
        ))}

        {/* Population (for GA) */}
        {population?.map((ind, i) => (
          <Circle
            key={`p-${i}`}
            cx={xScale(ind.x)}
            cy={yScale(ind.fitness)}
            r={4}
            fill={theme.accentAmber}
            opacity={0.7}
            stroke={
              best && Math.abs(ind.x - best.x) < 0.01 ? PALETTE.white : "none"
            }
            strokeWidth={2}
          />
        ))}

        {/* Current position (draggable when onStartChange provided) */}
        {pos && (
          <Circle
            cx={xScale(pos.x)}
            cy={yScale(func.fn(pos.x))}
            r={7}
            fill={theme.accentGreen}
            stroke={PALETTE.white}
            strokeWidth={2}
            className={onStartChange ? "cursor-grab" : undefined}
            onPointerDown={onStartChange ? handlePointerDown : undefined}
            onPointerMove={onStartChange ? handlePointerMove : undefined}
            onPointerUp={onStartChange ? handlePointerUp : undefined}
            onPointerLeave={onStartChange ? handlePointerUp : undefined}
          />
        )}
      </Group>
    </svg>
  );
}
