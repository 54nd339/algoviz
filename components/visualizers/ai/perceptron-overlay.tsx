"use client";

import { LinePath } from "@visx/shape";

import { PALETTE } from "@/lib/utils/theme-colors";

type NumericScale = (value: number) => number;

interface PerceptronOverlayProps {
  boundary: { m: number; b: number } | null;
  xDomain: [number, number];
  xScale: NumericScale;
  yScale: NumericScale;
  innerWidth: number;
  innerHeight: number;
}

/** Draws the perceptron decision boundary as a dashed line. */
export function PerceptronOverlay({
  boundary,
  xDomain,
  xScale,
  yScale,
}: PerceptronOverlayProps) {
  if (!boundary) return null;
  const { m, b } = boundary;
  const x1 = xDomain[0];
  const x2 = xDomain[1];
  const lineData = [
    { x: x1, y: m * x1 + b },
    { x: x2, y: m * x2 + b },
  ];

  return (
    <LinePath
      data={lineData}
      x={(d) => xScale(d.x)}
      y={(d) => yScale(d.y)}
      stroke={PALETTE.accentRose}
      strokeWidth={2}
      strokeDasharray="6,3"
    />
  );
}
