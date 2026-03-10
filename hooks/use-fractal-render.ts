import { useCallback, useEffect, useRef, useState } from "react";

import type { ColorPalette } from "@/lib/algorithms/fractals";
import {
  getFractalPool,
  terminateFractalWorker,
} from "@/lib/workers/worker-api";

export interface UseFractalRenderParams {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  zoom: number;
  effectiveIterations: number;
  colorPalette: ColorPalette;
  isJulia: boolean;
  cReal: number;
  cImag: number;
}

export interface UseFractalRenderResult {
  computing: boolean;
  threadCount: number;
}

/**
 * Custom hook that encapsulates fractal worker orchestration:
 * - Spawns workers and divides rendering into bands
 * - Assembles band results into the final image
 * - Handles abort on param change and cleanup on unmount
 */
export function useFractalRender({
  canvasRef,
  width,
  height,
  centerX,
  centerY,
  zoom,
  effectiveIterations,
  colorPalette,
  isJulia,
  cReal,
  cImag,
}: UseFractalRenderParams): UseFractalRenderResult {
  const [computing, setComputing] = useState(false);
  const [threadCount, setThreadCount] = useState(0);
  const abortRef = useRef(false);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    abortRef.current = false;
    setComputing(true);

    try {
      const pool = getFractalPool();
      const numWorkers = pool.length;
      if (numWorkers === 0) return;
      setThreadCount(numWorkers);
      const rowsPerBand = Math.ceil(height / numWorkers);

      const bandPromises: Promise<{
        startRow: number;
        pixels: Uint8ClampedArray;
      }>[] = [];
      for (let i = 0; i < numWorkers; i++) {
        const startRow = i * rowsPerBand;
        const endRow = Math.min(startRow + rowsPerBand, height);
        if (startRow >= height) break;

        const worker = pool[i % pool.length];
        bandPromises.push(
          worker.computeBand(
            width,
            height,
            startRow,
            endRow,
            centerX,
            centerY,
            zoom,
            effectiveIterations,
            colorPalette,
            isJulia,
            cReal,
            cImag,
          ) as Promise<{ startRow: number; pixels: Uint8ClampedArray }>,
        );
      }

      const bands = await Promise.all(bandPromises);
      if (abortRef.current) return;

      bands.sort((a, b) => a.startRow - b.startRow);

      for (const band of bands) {
        if (abortRef.current) return;
        const bandHeight = band.pixels.length / (width * 4);
        const imageData = new ImageData(
          new Uint8ClampedArray(band.pixels),
          width,
          bandHeight,
        );
        ctx.putImageData(imageData, 0, band.startRow);
      }
    } catch {
      // Worker error — fall back silently
    } finally {
      setComputing(false);
    }
  }, [
    canvasRef,
    width,
    height,
    centerX,
    centerY,
    zoom,
    effectiveIterations,
    colorPalette,
    isJulia,
    cReal,
    cImag,
  ]);

  useEffect(() => {
    abortRef.current = true;
    const id = setTimeout(() => render(), 50);
    return () => {
      clearTimeout(id);
      abortRef.current = true;
    };
  }, [render]);

  useEffect(() => {
    return () => terminateFractalWorker();
  }, []);

  return { computing, threadCount };
}
