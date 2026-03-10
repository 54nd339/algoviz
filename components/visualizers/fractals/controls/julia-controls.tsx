"use client";

import { Slider } from "@/components/ui";
import type { ColorPalette } from "@/lib/algorithms/fractals";
import { cn } from "@/lib/utils";

import type { FractalPreset } from "./fractal-controls-types";

export interface JuliaPreset {
  name: string;
  cReal: number;
  cImag: number;
  maxIterations: number;
  colorPalette: ColorPalette;
}

export const JULIA_PRESETS: JuliaPreset[] = [
  {
    name: "Dendrite (c = i)",
    cReal: 0,
    cImag: 1,
    maxIterations: 150,
    colorPalette: "rainbow",
  },
  {
    name: "Rabbit",
    cReal: -0.123,
    cImag: 0.745,
    maxIterations: 200,
    colorPalette: "ice",
  },
  {
    name: "Spiral",
    cReal: -0.8,
    cImag: 0.156,
    maxIterations: 200,
    colorPalette: "fire",
  },
  {
    name: "Lightning",
    cReal: -0.4,
    cImag: 0.6,
    maxIterations: 200,
    colorPalette: "matrix",
  },
  {
    name: "Galaxy",
    cReal: 0.285,
    cImag: 0.01,
    maxIterations: 300,
    colorPalette: "rainbow",
  },
];

interface JuliaControlsProps {
  cReal: number;
  onCRealChange: (val: number) => void;
  cImag: number;
  onCImagChange: (val: number) => void;
  onApplyPreset?: (preset: FractalPreset) => void;
  className?: string;
}

export function JuliaControls({
  cReal,
  onCRealChange,
  cImag,
  onCImagChange,
  onApplyPreset,
  className,
}: JuliaControlsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {onApplyPreset && (
        <div className="flex items-center gap-1">
          {JULIA_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() =>
                onApplyPreset({
                  ...p,
                  zoom: 1,
                  centerX: 0,
                  centerY: 0,
                })
              }
              className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-text-secondary transition-colors hover:border-accent-green/30 hover:text-accent-green"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-text-muted">
          c_re={cReal.toFixed(3)}
        </span>
        <Slider
          value={[cReal]}
          min={-2}
          max={2}
          step={0.01}
          onValueChange={([v]) => onCRealChange(v)}
          className="w-20"
          aria-label="c real"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-text-muted">
          c_im={cImag.toFixed(3)}
        </span>
        <Slider
          value={[cImag]}
          min={-2}
          max={2}
          step={0.01}
          onValueChange={([v]) => onCImagChange(v)}
          className="w-20"
          aria-label="c imaginary"
        />
      </div>
    </div>
  );
}
