import type { ColorPalette } from "@/lib/algorithms/fractals";

export interface FractalPreset {
  zoom?: number;
  centerX?: number;
  centerY?: number;
  maxIterations?: number;
  colorPalette?: ColorPalette;
  cReal?: number;
  cImag?: number;
}
