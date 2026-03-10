"use client";

import { useCallback, useState } from "react";

import type { ColorPalette, FractalType } from "@/lib/algorithms/fractals";
import { FRACTAL_GENERATORS } from "@/lib/algorithms/fractals";
import type { AlgorithmMeta } from "@/types";

export function useFractalControls(
  configure: ReturnType<typeof import("./use-visualizer").useVisualizer>["configure"],
  algorithmMeta: AlgorithmMeta | null,
) {
  const [fractalType, setFractalType] = useState<FractalType>("mandelbrot");
  const [maxIterations, setMaxIterations] = useState(100);
  const [colorPalette, setColorPalette] = useState<ColorPalette>("rainbow");
  const [zoom, setZoom] = useState(1);
  const [centerX, setCenterX] = useState(-0.5);
  const [centerY, setCenterY] = useState(0);
  const [depth, setDepth] = useState(5);
  const [lSystemPresetIndex, setLSystemPresetIndex] = useState(3);
  const [cReal, setCReal] = useState(-0.123);
  const [cImag, setCImag] = useState(0.745);

  const handleZoomChange = useCallback(
    (newZoom: number, cx: number, cy: number) => {
      setZoom(newZoom);
      setCenterX(cx);
      setCenterY(cy);
    },
    [],
  );

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setCenterX(fractalType === "julia" ? 0 : -0.5);
    setCenterY(0);
  }, [fractalType]);

  const handleDepthChange = useCallback(
    (d: number) => {
      setDepth(d);
      if (
        algorithmMeta &&
        (fractalType === "sierpinski" || fractalType === "koch")
      ) {
        const gen = FRACTAL_GENERATORS[algorithmMeta.id];
        if (gen) configure(algorithmMeta, gen, { maxDepth: d });
      }
    },
    [algorithmMeta, fractalType, configure],
  );

  const handleLSystemPresetChange = useCallback(
    (idx: number) => {
      setLSystemPresetIndex(idx);
      if (algorithmMeta && fractalType === "l-system") {
        const gen = FRACTAL_GENERATORS[algorithmMeta.id];
        if (gen) configure(algorithmMeta, gen, { presetIndex: idx });
      }
    },
    [algorithmMeta, fractalType, configure],
  );

  const handleCRealChange = useCallback((val: number) => {
    setCReal(val);
  }, []);

  const handleCImagChange = useCallback((val: number) => {
    setCImag(val);
  }, []);

  const handleApplyPreset = useCallback(
    (preset: {
      zoom?: number;
      centerX?: number;
      centerY?: number;
      maxIterations?: number;
      colorPalette?: ColorPalette;
      cReal?: number;
      cImag?: number;
    }) => {
      if (preset.zoom !== undefined) setZoom(preset.zoom);
      if (preset.centerX !== undefined) setCenterX(preset.centerX);
      if (preset.centerY !== undefined) setCenterY(preset.centerY);
      if (preset.maxIterations !== undefined)
        setMaxIterations(preset.maxIterations);
      if (preset.colorPalette !== undefined)
        setColorPalette(preset.colorPalette);
      if (preset.cReal !== undefined) setCReal(preset.cReal);
      if (preset.cImag !== undefined) setCImag(preset.cImag);
    },
    [],
  );

  return {
    fractalType,
    setFractalType,
    maxIterations,
    setMaxIterations,
    colorPalette,
    setColorPalette,
    zoom,
    centerX,
    centerY,
    depth,
    lSystemPresetIndex,
    cReal,
    cImag,
    handleZoomChange,
    handleZoomReset,
    handleDepthChange,
    handleLSystemPresetChange,
    handleCRealChange,
    handleCImagChange,
    handleApplyPreset,
  };
}
