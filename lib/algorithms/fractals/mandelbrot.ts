import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { ColorPalette, MandelbrotStep } from "./types";

export const mandelbrotMeta: AlgorithmMeta = {
  id: "mandelbrot",
  name: "Mandelbrot Set",
  category: "fractals",
  description:
    "The Mandelbrot set is the set of complex numbers c for which the function f(z) = z² + c does not diverge when iterated from z = 0. Produces infinitely detailed fractal boundary patterns.",
  timeComplexity: { best: "O(n)", average: "O(n·k)", worst: "O(n·k)" },
  spaceComplexity: "O(n)",
  pseudocode: `for each pixel (px, py):
  x0 = scaled(px), y0 = scaled(py)
  x = 0, y = 0, iteration = 0
  while x² + y² ≤ 4 and iteration < max:
    xtemp = x² - y² + x0
    y = 2·x·y + y0
    x = xtemp
    iteration++
  color = palette(iteration / max)`,
  presets: [
    {
      name: "Full Set",
      generator: () => ({
        width: 600,
        height: 400,
        maxIterations: 100,
        zoom: 1,
        centerX: -0.5,
        centerY: 0,
        colorPalette: "rainbow" as ColorPalette,
      }),
      expectedCase: "average",
    },
    {
      name: "Seahorse Valley",
      generator: () => ({
        width: 600,
        height: 400,
        maxIterations: 300,
        zoom: 50,
        centerX: -0.75,
        centerY: 0.1,
        colorPalette: "fire" as ColorPalette,
      }),
      expectedCase: "average",
    },
    {
      name: "Spiral Detail",
      generator: () => ({
        width: 600,
        height: 400,
        maxIterations: 500,
        zoom: 200,
        centerX: -0.7463,
        centerY: 0.1102,
        colorPalette: "ice" as ColorPalette,
      }),
      expectedCase: "worst",
    },
  ],
};

registerAlgorithm(mandelbrotMeta);

export function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export function getColor(
  iteration: number,
  maxIterations: number,
  palette: ColorPalette,
): [number, number, number] {
  if (iteration >= maxIterations) return [0, 0, 0];
  const t = iteration / maxIterations;

  switch (palette) {
    case "rainbow":
      return hslToRgb(t * 360, 1, 0.5);
    case "fire":
      return [
        Math.round(Math.min(255, t * 3 * 255)),
        Math.round(Math.min(255, Math.max(0, (t - 0.33) * 3) * 255)),
        Math.round(Math.min(255, Math.max(0, (t - 0.66) * 3) * 255)),
      ];
    case "ice":
      return [
        Math.round(Math.max(0, 1 - t * 2) * 200),
        Math.round(Math.min(255, t * 2 * 255)),
        255,
      ];
    case "matrix":
      return [0, Math.round(t * 255), Math.round(t * 60)];
    case "monochrome":
      return [Math.round(t * 255), Math.round(t * 255), Math.round(t * 255)];
  }
}

export function computeMandelbrotRow(
  row: number,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  zoom: number,
  maxIterations: number,
  palette: ColorPalette,
  isJulia: boolean = false,
  cReal: number = 0,
  cImag: number = 0,
): Uint8ClampedArray {
  const rowData = new Uint8ClampedArray(width * 4);
  const scale = 3.5 / (width * zoom);

  for (let px = 0; px < width; px++) {
    const x0 = (px - width / 2) * scale + centerX;
    const y0 = (row - height / 2) * scale + centerY;

    let x: number, y: number, cx: number, cy: number;
    if (isJulia) {
      x = x0;
      y = y0;
      cx = cReal;
      cy = cImag;
    } else {
      x = 0;
      y = 0;
      cx = x0;
      cy = y0;
    }

    let iteration = 0;
    while (x * x + y * y <= 4 && iteration < maxIterations) {
      const xTemp = x * x - y * y + cx;
      y = 2 * x * y + cy;
      x = xTemp;
      iteration++;
    }

    const [r, g, b] = getColor(iteration, maxIterations, palette);
    const idx = px * 4;
    rowData[idx] = r;
    rowData[idx + 1] = g;
    rowData[idx + 2] = b;
    rowData[idx + 3] = 255;
  }
  return rowData;
}

export function* mandelbrot(input: {
  width: number;
  height: number;
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  colorPalette: ColorPalette;
}): AlgorithmGenerator<MandelbrotStep> {
  const { width, height, maxIterations, zoom, centerX, centerY, colorPalette } =
    input;
  const pixels = new Uint8ClampedArray(width * height * 4);

  yield {
    type: "init",
    data: {
      pixels: new Uint8ClampedArray(width * height * 4),
      width,
      height,
      maxIterations,
      currentIteration: 0,
      zoom,
      centerX,
      centerY,
      scanLine: 0,
      colorPalette,
      isJulia: false,
    },
    description: `Computing Mandelbrot set (${width}×${height}, ${maxIterations} iterations, zoom ${zoom.toFixed(1)}×)`,
    codeLine: 1,
    variables: { width, height, maxIterations, zoom, centerX, centerY },
  };

  const rowBatch = Math.max(1, Math.floor(height / 40));
  for (let row = 0; row < height; row++) {
    const rowData = computeMandelbrotRow(
      row,
      width,
      height,
      centerX,
      centerY,
      zoom,
      maxIterations,
      colorPalette,
    );
    pixels.set(rowData, row * width * 4);

    if (row % rowBatch === 0 || row === height - 1) {
      yield {
        type: "scanline",
        data: {
          pixels: new Uint8ClampedArray(pixels),
          width,
          height,
          maxIterations,
          currentIteration: row,
          zoom,
          centerX,
          centerY,
          scanLine: row,
          colorPalette,
          isJulia: false,
        },
        description: `Scanline ${row + 1} of ${height}`,
        codeLine: 4,
        variables: {
          scanLine: row,
          progress: ((row / height) * 100).toFixed(1) + "%",
        },
      };
    }
  }

  yield {
    type: "done",
    data: {
      pixels: new Uint8ClampedArray(pixels),
      width,
      height,
      maxIterations,
      currentIteration: height,
      zoom,
      centerX,
      centerY,
      scanLine: height,
      colorPalette,
      isJulia: false,
    },
    description: "Mandelbrot set computation complete",
    codeLine: 9,
    variables: { totalPixels: width * height },
  };
}
