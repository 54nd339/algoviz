import * as Comlink from "comlink";

type ColorPalette = "rainbow" | "fire" | "ice" | "matrix" | "monochrome";

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
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

function getColor(
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

const fractalWorker = {
  computeFullImage(
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    zoom: number,
    maxIterations: number,
    palette: ColorPalette,
    isJulia: boolean,
    cReal: number,
    cImag: number,
  ): Uint8ClampedArray {
    const pixels = new Uint8ClampedArray(width * height * 4);
    const scale = 3.5 / (width * zoom);

    for (let row = 0; row < height; row++) {
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
        const idx = (row * width + px) * 4;
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
      }
    }
    return Comlink.transfer(pixels, [pixels.buffer]);
  },

  computeBand(
    width: number,
    fullHeight: number,
    startRow: number,
    endRow: number,
    centerX: number,
    centerY: number,
    zoom: number,
    maxIterations: number,
    palette: ColorPalette,
    isJulia: boolean,
    cReal: number,
    cImag: number,
  ): { startRow: number; pixels: Uint8ClampedArray } {
    const bandHeight = endRow - startRow;
    const pixels = new Uint8ClampedArray(width * bandHeight * 4);
    const scale = 3.5 / (width * zoom);

    for (let row = startRow; row < endRow; row++) {
      for (let px = 0; px < width; px++) {
        const x0 = (px - width / 2) * scale + centerX;
        const y0 = (row - fullHeight / 2) * scale + centerY;

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
        const localRow = row - startRow;
        const idx = (localRow * width + px) * 4;
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
      }
    }
    return Comlink.transfer({ startRow, pixels }, [pixels.buffer]);
  },
};

export type FractalWorker = typeof fractalWorker;

Comlink.expose(fractalWorker);
