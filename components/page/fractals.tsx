"use client";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { FractalControls } from "@/components/visualizers/fractals/controls";
import { LSystemCanvas } from "@/components/visualizers/fractals/l-system-canvas";
import { MandelbrotCanvas } from "@/components/visualizers/fractals/mandelbrot-canvas";
import { RecursiveCanvas } from "@/components/visualizers/fractals/recursive-canvas";
import type { LSystemStep, RecursiveFractalStep } from "@/lib/algorithms/fractals";
import { FRACTAL_GENERATORS } from "@/lib/algorithms/fractals";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import { useFractalControls } from "@/hooks/use-fractal-controls";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/fractals";

export default function FractalsClient() {
  const { currentStep, algorithmMeta, configure } = useVisualizer();
  useAlgoFromUrl(
    "fractals",
    FRACTAL_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const {
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
  } = useFractalControls(configure, algorithmMeta);

  const isMandelbrotLike =
    fractalType === "mandelbrot" || fractalType === "julia";
  const isRecursive = fractalType === "sierpinski" || fractalType === "koch";
  const showSidePanels = !isMandelbrotLike;

  return (
    <VisualizerPageLayout
      controls={
        <FractalControls
          fractalType={fractalType}
          onFractalTypeChange={setFractalType}
          maxIterations={maxIterations}
          onMaxIterationsChange={setMaxIterations}
          colorPalette={colorPalette}
          onColorPaletteChange={setColorPalette}
          depth={depth}
          onDepthChange={handleDepthChange}
          lSystemPresetIndex={lSystemPresetIndex}
          onLSystemPresetChange={handleLSystemPresetChange}
          cReal={cReal}
          onCRealChange={handleCRealChange}
          cImag={cImag}
          onCImagChange={handleCImagChange}
          onZoomReset={handleZoomReset}
          onApplyPreset={handleApplyPreset}
        />
      }
      canvas={
        <div
          className="flex flex-1 items-center justify-center overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4"
          style={{
            backgroundImage: isMandelbrotLike
              ? undefined
              : "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          {fractalType === "mandelbrot" && (
            <MandelbrotCanvas
              maxIterations={maxIterations}
              zoom={zoom}
              centerX={centerX}
              centerY={centerY}
              colorPalette={colorPalette}
              onZoomChange={handleZoomChange}
            />
          )}

          {fractalType === "julia" && (
            <MandelbrotCanvas
              maxIterations={maxIterations}
              zoom={zoom}
              centerX={centerX}
              centerY={centerY}
              colorPalette={colorPalette}
              isJulia
              cReal={cReal}
              cImag={cImag}
              onZoomChange={handleZoomChange}
            />
          )}

          {isRecursive && (
            <RecursiveCanvas
              step={currentStep as AlgorithmStep<RecursiveFractalStep> | null}
              className="h-full w-full"
            />
          )}

          {fractalType === "l-system" && (
            <LSystemCanvas
              step={currentStep as AlgorithmStep<LSystemStep> | null}
              className="h-full w-full"
            />
          )}
        </div>
      }
      showPlayerControls={!isMandelbrotLike}
      showPostRunSummary={!isMandelbrotLike}
      showSidePanel={showSidePanels}
    />
  );
}
