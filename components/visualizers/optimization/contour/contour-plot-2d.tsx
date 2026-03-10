"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle, LinePath } from "@visx/shape";

import { FUNCTIONS_2D } from "@/lib/algorithms/optimization";
import { cn } from "@/lib/utils";
import {
  computeHeatmapCells,
  valueToColor,
} from "@/lib/utils/contour-data";
import {
  getThemeColors,
  MONO_FONT_FAMILY,
  PALETTE,
} from "@/lib/utils/theme-colors";

import type { ContourPlotInnerProps } from "./contour-plot-shared";
import { MARGIN } from "./contour-plot-shared";

export function ContourPlot2D({
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
      FUNCTIONS_2D.find((f) => f.id === step?.functionId) ?? FUNCTIONS_2D[0],
    [step?.functionId],
  );

  const xScale = useMemo(
    () =>
      scaleLinear<number>({ domain: func.domain.x, range: [0, innerWidth] }),
    [func, innerWidth],
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({ domain: func.domain.y, range: [innerHeight, 0] }),
    [func, innerHeight],
  );

  const heatmap = useMemo(
    () =>
      computeHeatmapCells(
        func.fn,
        func.domain.x,
        func.domain.y,
        innerWidth,
        innerHeight,
        40,
      ),
    [func, innerWidth, innerHeight],
  );

  const trail = step?.trail ?? [];
  const pos = step?.position;
  const grad = step?.gradient;
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
      const innerY = svgPt.y - MARGIN.top;
      const [xMin, xMax] = func.domain.x;
      const [yMin, yMax] = func.domain.y;
      const x = Math.max(xMin, Math.min(xMax, xScale.invert(innerX)));
      const y = Math.max(yMin, Math.min(yMax, yScale.invert(innerY)));
      onStartChange(x, y);
    },
    [onStartChange, dragging, xScale, yScale, func.domain.x, func.domain.y],
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
        {/* Heatmap */}
        {heatmap.map((cell, i) => (
          <rect
            key={i}
            x={cell.x}
            y={cell.y}
            width={cell.w}
            height={cell.h}
            fill={valueToColor(cell.value)}
            opacity={0.85}
          />
        ))}

        <GridRows
          scale={yScale}
          width={innerWidth}
          stroke={PALETTE.gridLineLight}
        />
        <GridColumns
          scale={xScale}
          height={innerHeight}
          stroke={PALETTE.gridLineLight}
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

        {/* Trail */}
        {trail.length > 1 && (
          <LinePath
            data={trail}
            x={(d) => xScale(d.x)}
            y={(d) => yScale(d.y)}
            stroke={theme.accentGreen}
            strokeWidth={1.5}
            strokeOpacity={0.7}
          />
        )}

        {/* Current position (draggable when onStartChange provided) */}
        {pos && (
          <Circle
            cx={xScale(pos.x)}
            cy={yScale(pos.y)}
            r={6}
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

        {/* Gradient arrow */}
        {pos &&
          grad &&
          (Math.abs(grad.dx) > 0.01 || Math.abs(grad.dy) > 0.01) && (
            <line
              x1={xScale(pos.x)}
              y1={yScale(pos.y)}
              x2={xScale(pos.x) - grad.dx * 5}
              y2={yScale(pos.y) + grad.dy * 5}
              stroke={theme.accentAmber}
              strokeWidth={2}
              markerEnd="url(#arrowhead)"
            />
          )}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill={theme.accentAmber} />
          </marker>
        </defs>
      </Group>
    </svg>
  );
}
