import type { OptimizationStep } from "@/lib/algorithms/optimization";

/** SVG plot margin (px). Shared so 1D and 2D use identical layout for pointer coords. */
export const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

/** Props passed from wrapper to inner 1D/2D plot components. */
export interface ContourPlotInnerProps {
  step: OptimizationStep | null;
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  onStartChange?: (x: number, y?: number) => void;
}
