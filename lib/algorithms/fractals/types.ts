export interface FractalShape {
  type: "line" | "triangle";
  points: { x: number; y: number }[];
  depth: number;
}

export interface MandelbrotStep {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
  maxIterations: number;
  currentIteration: number;
  zoom: number;
  centerX: number;
  centerY: number;
  scanLine: number;
  colorPalette: ColorPalette;
  isJulia: boolean;
  cReal?: number;
  cImag?: number;
}

export interface RecursiveFractalStep {
  shapes: FractalShape[];
  depth: number;
  maxDepth: number;
  fractalType: "sierpinski" | "koch";
}

export interface LSystemStep {
  axiom: string;
  rules: Record<string, string>;
  currentString: string;
  iteration: number;
  maxIteration: number;
  segments: LSystemSegment[];
  angle: number;
  presetName: string;
}

export interface LSystemSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
}

export type ColorPalette = "rainbow" | "fire" | "ice" | "matrix" | "monochrome";

export type FractalType =
  | "mandelbrot"
  | "julia"
  | "sierpinski"
  | "koch"
  | "l-system";

export interface LSystemPreset {
  name: string;
  axiom: string;
  rules: Record<string, string>;
  angle: number;
  iterations: number;
}

export const L_SYSTEM_PRESETS: LSystemPreset[] = [
  {
    name: "Fractal Tree",
    axiom: "0",
    rules: { "1": "11", "0": "1[-0]+0" },
    angle: 45,
    iterations: 6,
  },
  {
    name: "Sierpinski Triangle",
    axiom: "F-G-G",
    rules: { F: "F-G+F+G-F", G: "GG" },
    angle: 120,
    iterations: 5,
  },
  {
    name: "Dragon Curve",
    axiom: "F",
    rules: { F: "F+G", G: "F-G" },
    angle: 90,
    iterations: 10,
  },
  {
    name: "Plant / Fern",
    axiom: "X",
    rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" },
    angle: 25,
    iterations: 5,
  },
  {
    name: "Koch Curve",
    axiom: "F",
    rules: { F: "F+F-F-F+F" },
    angle: 90,
    iterations: 4,
  },
  {
    name: "Hilbert Curve",
    axiom: "A",
    rules: { A: "+BF-AFA-FB+", B: "-AF+BFB+FA-" },
    angle: 90,
    iterations: 5,
  },
  {
    name: "Penrose Tiling",
    axiom: "[F]++[F]++[F]++[F]++[F]",
    rules: { F: "F++F----F++F" },
    angle: 36,
    iterations: 4,
  },
];
