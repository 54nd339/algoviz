"use client";

import { LinePath } from "@visx/shape";

import { getThemeColors } from "@/lib/utils/theme-colors";

type NumericScale = (value: number) => number;

interface RegressionOverlayProps {
  weights: { m: number; b: number };
  xDomain: [number, number];
  xScale: NumericScale;
  yScale: NumericScale;
  innerWidth: number;
  innerHeight: number;
}

/** Renders the fitted regression line y = mx + b. */
export function RegressionOverlay({
  weights,
  xDomain,
  xScale,
  yScale,
}: RegressionOverlayProps) {
  const theme = getThemeColors();
  const { m, b } = weights;
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
      stroke={theme.accentGreen}
      strokeWidth={2}
      strokeOpacity={0.9}
    />
  );
}
