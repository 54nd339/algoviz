"use client";

import { useEffect, useMemo } from "react";
import { RotateCcw } from "lucide-react";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { CategoryControlsHeader } from "@/components/visualizers/shared";
import {
  type ColorPalette,
  FRACTAL_GENERATORS,
  type FractalType,
} from "@/lib/algorithms/fractals";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import type { FractalPreset } from "./fractal-controls-types";
import { JuliaControls } from "./julia-controls";
import { LSystemControls } from "./l-system-controls";
import { MandelbrotControls } from "./mandelbrot-controls";
import { RecursiveControls } from "./recursive-controls";

interface FractalControlsProps {
  fractalType: FractalType;
  onFractalTypeChange: (type: FractalType) => void;
  maxIterations: number;
  onMaxIterationsChange: (val: number) => void;
  colorPalette: ColorPalette;
  onColorPaletteChange: (palette: ColorPalette) => void;
  depth: number;
  onDepthChange: (d: number) => void;
  lSystemPresetIndex: number;
  onLSystemPresetChange: (idx: number) => void;
  cReal: number;
  onCRealChange: (val: number) => void;
  cImag: number;
  onCImagChange: (val: number) => void;
  onZoomReset: () => void;
  onApplyPreset?: (preset: FractalPreset) => void;
  className?: string;
}

export function FractalControls({
  fractalType,
  onFractalTypeChange,
  colorPalette,
  onColorPaletteChange,
  depth,
  onDepthChange,
  lSystemPresetIndex,
  onLSystemPresetChange,
  cReal,
  onCRealChange,
  cImag,
  onCImagChange,
  onZoomReset,
  onApplyPreset,
  className,
}: FractalControlsProps) {
  const { algorithmMeta } = useVisualizer();

  const typeMap: Record<string, FractalType> = useMemo(
    () => ({
      mandelbrot: "mandelbrot",
      julia: "julia",
      sierpinski: "sierpinski",
      koch: "koch",
      "l-system": "l-system",
    }),
    [],
  );

  useEffect(() => {
    const id = algorithmMeta?.id;
    if (id && typeMap[id] && typeMap[id] !== fractalType) {
      onFractalTypeChange(typeMap[id]);
    }
  }, [algorithmMeta?.id, typeMap, fractalType, onFractalTypeChange]);

  const isMandelbrotLike =
    fractalType === "mandelbrot" || fractalType === "julia";
  const isRecursive = fractalType === "sierpinski" || fractalType === "koch";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <CategoryControlsHeader
        category="fractals"
        generators={
          FRACTAL_GENERATORS as Record<
            string,
            (input: unknown) => Generator<AlgorithmStep, void, undefined>
          >
        }
        defaultInput={{}}
        pickerClassName="w-48"
        presetsClassName={isMandelbrotLike ? "hidden" : "w-44"}
      />

      {fractalType === "mandelbrot" && (
        <MandelbrotControls onApplyPreset={onApplyPreset} />
      )}

      {fractalType === "julia" && (
        <JuliaControls
          cReal={cReal}
          onCRealChange={onCRealChange}
          cImag={cImag}
          onCImagChange={onCImagChange}
          onApplyPreset={onApplyPreset}
        />
      )}

      {isMandelbrotLike && (
        <>
          <Select
            value={colorPalette}
            onValueChange={(v) => onColorPaletteChange(v as ColorPalette)}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rainbow">Rainbow</SelectItem>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="ice">Ice</SelectItem>
              <SelectItem value="matrix">Matrix</SelectItem>
              <SelectItem value="monochrome">Mono</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={onZoomReset}
            className="gap-1.5"
          >
            <RotateCcw size={14} />
            Reset
          </Button>
        </>
      )}

      {isRecursive && (
        <RecursiveControls depth={depth} onDepthChange={onDepthChange} />
      )}

      {fractalType === "l-system" && (
        <LSystemControls
          lSystemPresetIndex={lSystemPresetIndex}
          onLSystemPresetChange={onLSystemPresetChange}
        />
      )}
    </div>
  );
}
