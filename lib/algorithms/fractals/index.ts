export { julia, juliaMeta } from "./julia";
export { koch, kochMeta } from "./koch";
export { lSystem, lSystemMeta } from "./l-system";
export {
  computeMandelbrotRow,
  getColor,
  hslToRgb,
  mandelbrot,
  mandelbrotMeta,
} from "./mandelbrot";
export { sierpinski, sierpinskiMeta } from "./sierpinski";
export type {
  ColorPalette,
  FractalShape,
  FractalType,
  LSystemPreset,
  LSystemSegment,
  LSystemStep,
  MandelbrotStep,
  RecursiveFractalStep,
} from "./types";
export { L_SYSTEM_PRESETS } from "./types";

import type { AlgorithmStep } from "@/types";

import { julia } from "./julia";
import { koch } from "./koch";
import { lSystem } from "./l-system";
import { mandelbrot } from "./mandelbrot";
import { sierpinski } from "./sierpinski";
import type { MandelbrotStep } from "./types";
import type { RecursiveFractalStep } from "./types";
import type { LSystemStep } from "./types";

export const FRACTAL_GENERATORS: Record<
  string,
  (
    input: unknown,
  ) => Generator<
    AlgorithmStep<MandelbrotStep | RecursiveFractalStep | LSystemStep>,
    void,
    undefined
  >
> = {
  mandelbrot: (input) =>
    mandelbrot(
      input as {
        width: number;
        height: number;
        maxIterations: number;
        zoom: number;
        centerX: number;
        centerY: number;
        colorPalette: "rainbow" | "fire" | "ice" | "matrix" | "monochrome";
      },
    ),
  julia: (input) =>
    julia(
      input as {
        width: number;
        height: number;
        maxIterations: number;
        zoom: number;
        centerX: number;
        centerY: number;
        colorPalette: "rainbow" | "fire" | "ice" | "matrix" | "monochrome";
        cReal: number;
        cImag: number;
      },
    ),
  sierpinski: (input) => sierpinski(input as { maxDepth: number }),
  koch: (input) => koch(input as { maxDepth: number }),
  "l-system": (input) =>
    lSystem(
      input as {
        presetIndex?: number;
        axiom?: string;
        rules?: Record<string, string>;
        angle?: number;
        iterations?: number;
      },
    ),
};
