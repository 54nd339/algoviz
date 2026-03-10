import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import { computeMandelbrotRow } from "./mandelbrot";
import type { ColorPalette, MandelbrotStep } from "./types";

export const juliaMeta: AlgorithmMeta = {
  id: "julia",
  name: "Julia Set",
  category: "fractals",
  description:
    "Julia sets are related to the Mandelbrot set. For each complex constant c, there is a Julia set formed by iterating z² + c. Different c values produce strikingly different fractals.",
  timeComplexity: { best: "O(n)", average: "O(n·k)", worst: "O(n·k)" },
  spaceComplexity: "O(n)",
  pseudocode: `for each pixel (px, py):
  z = complex(scaled(px), scaled(py))
  c = fixed constant (cReal + cImag·i)
  iteration = 0
  while |z|² ≤ 4 and iteration < max:
    z = z² + c
    iteration++
  color = palette(iteration / max)`,
  presets: [
    {
      name: "Dendrite (c = i)",
      generator: () => ({
        width: 600,
        height: 400,
        maxIterations: 150,
        zoom: 1,
        centerX: 0,
        centerY: 0,
        colorPalette: "rainbow" as ColorPalette,
        cReal: 0,
        cImag: 1,
      }),
      expectedCase: "average",
    },
    {
      name: "Rabbit (c = -0.123 + 0.745i)",
      generator: () => ({
        width: 600,
        height: 400,
        maxIterations: 200,
        zoom: 1,
        centerX: 0,
        centerY: 0,
        colorPalette: "ice" as ColorPalette,
        cReal: -0.123,
        cImag: 0.745,
      }),
      expectedCase: "average",
    },
    {
      name: "Spiral (c = -0.8 + 0.156i)",
      generator: () => ({
        width: 600,
        height: 400,
        maxIterations: 200,
        zoom: 1,
        centerX: 0,
        centerY: 0,
        colorPalette: "fire" as ColorPalette,
        cReal: -0.8,
        cImag: 0.156,
      }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(juliaMeta);

export function* julia(input: {
  width: number;
  height: number;
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  colorPalette: ColorPalette;
  cReal: number;
  cImag: number;
}): AlgorithmGenerator<MandelbrotStep> {
  const {
    width,
    height,
    maxIterations,
    zoom,
    centerX,
    centerY,
    colorPalette,
    cReal,
    cImag,
  } = input;
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
      isJulia: true,
      cReal,
      cImag,
    },
    description: `Computing Julia set for c = ${cReal} + ${cImag}i`,
    codeLine: 1,
    variables: { cReal, cImag, maxIterations, zoom },
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
      true,
      cReal,
      cImag,
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
          isJulia: true,
          cReal,
          cImag,
        },
        description: `Scanline ${row + 1} of ${height}`,
        codeLine: 5,
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
      isJulia: true,
      cReal,
      cImag,
    },
    description: `Julia set complete for c = ${cReal} + ${cImag}i`,
    codeLine: 8,
    variables: { totalPixels: width * height },
  };
}
