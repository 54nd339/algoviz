export type SortMode = "brightness" | "hue" | "saturation";

export function rgbToBrightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function rgbToHue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h = 0;
  if (max === r) h = ((g - b) / d + 6) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (h / 6) * 360;
}

export function rgbToSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max === 0) return 0;
  return (max - min) / max;
}

export function getPixelSortValue(
  r: number,
  g: number,
  b: number,
  mode: SortMode,
): number {
  switch (mode) {
    case "brightness":
      return rgbToBrightness(r, g, b);
    case "hue":
      return rgbToHue(r, g, b);
    case "saturation":
      return rgbToSaturation(r, g, b) * 255;
    default:
      return rgbToBrightness(r, g, b);
  }
}

/** Sort a row of pixels by sortVal (stable, handles duplicates for hue/saturation). */
export function sortRowPixels(
  imgData: ImageData,
  width: number,
  y: number,
  getSortVal: (r: number, g: number, b: number) => number,
): void {
  const rowStart = y * width * 4;
  const pixels: {
    r: number;
    g: number;
    b: number;
    a: number;
    sortVal: number;
    idx: number;
  }[] = [];
  for (let x = 0; x < width; x++) {
    const idx = rowStart + x * 4;
    const r = imgData.data[idx];
    const g = imgData.data[idx + 1];
    const b = imgData.data[idx + 2];
    const a = imgData.data[idx + 3];
    pixels.push({ r, g, b, a, sortVal: getSortVal(r, g, b), idx: x });
  }
  pixels.sort((a, b) => a.sortVal - b.sortVal || a.idx - b.idx);
  const temp = new Uint8ClampedArray(width * 4);
  for (let x = 0; x < width; x++) {
    const p = pixels[x];
    temp[x * 4] = p.r;
    temp[x * 4 + 1] = p.g;
    temp[x * 4 + 2] = p.b;
    temp[x * 4 + 3] = p.a;
  }
  for (let x = 0; x < width; x++) {
    imgData.data[rowStart + x * 4] = temp[x * 4];
    imgData.data[rowStart + x * 4 + 1] = temp[x * 4 + 1];
    imgData.data[rowStart + x * 4 + 2] = temp[x * 4 + 2];
    imgData.data[rowStart + x * 4 + 3] = temp[x * 4 + 3];
  }
}

/**
 * Runs pixel sort on an image, yielding control between row batches via requestAnimationFrame.
 * Accepts a shouldContinue callback to support stopping mid-run.
 */
export async function runPixelSort(
  ctx: CanvasRenderingContext2D,
  originalImageData: ImageData,
  width: number,
  height: number,
  sortMode: SortMode,
  rowsPerFrame: number,
  onProgress: (percent: number) => void,
  shouldContinue: () => boolean,
): Promise<void> {
  const imgData = new ImageData(
    new Uint8ClampedArray(originalImageData.data),
    width,
    height,
  );

  const getSortVal = (r: number, g: number, b: number) =>
    getPixelSortValue(r, g, b, sortMode);

  for (let row = 0; row < height; row += rowsPerFrame) {
    if (!shouldContinue()) break;

    const endRow = Math.min(row + rowsPerFrame, height);
    for (let y = row; y < endRow; y++) {
      sortRowPixels(imgData, width, y, getSortVal);
    }

    ctx.putImageData(imgData, 0, 0);
    onProgress(Math.floor((endRow / height) * 100));
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
  }
}

/** Creates a sample gradient image as a data URL for initial load. */
export function createSampleImageDataUrl(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 150;
  const ctx = canvas.getContext("2d")!;
  for (let y = 0; y < 150; y++) {
    for (let x = 0; x < 200; x++) {
      const r = Math.floor((x / 200) * 255);
      const g = Math.floor((y / 150) * 255);
      const b = Math.floor(
        Math.abs(Math.sin(x * 0.05) * Math.cos(y * 0.05)) * 255,
      );
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas.toDataURL();
}
