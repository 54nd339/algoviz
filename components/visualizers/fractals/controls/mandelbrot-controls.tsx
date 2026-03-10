"use client";

import type { ColorPalette } from "@/lib/algorithms/fractals";
import { cn } from "@/lib/utils";

export interface MandelbrotPreset {
  name: string;
  zoom: number;
  centerX: number;
  centerY: number;
  maxIterations: number;
  colorPalette: ColorPalette;
}

export const MANDELBROT_PRESETS: MandelbrotPreset[] = [
  {
    name: "Full Set",
    zoom: 1,
    centerX: -0.5,
    centerY: 0,
    maxIterations: 100,
    colorPalette: "rainbow",
  },
  {
    name: "Seahorse Valley",
    zoom: 50,
    centerX: -0.75,
    centerY: 0.1,
    maxIterations: 300,
    colorPalette: "fire",
  },
  {
    name: "Spiral Detail",
    zoom: 200,
    centerX: -0.7463,
    centerY: 0.1102,
    maxIterations: 500,
    colorPalette: "ice",
  },
];

interface MandelbrotControlsProps {
  onApplyPreset?: (preset: MandelbrotPreset) => void;
  className?: string;
}

export function MandelbrotControls({ onApplyPreset, className }: MandelbrotControlsProps) {
  if (!onApplyPreset) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {MANDELBROT_PRESETS.map((p, i) => (
        <button
          key={i}
          onClick={() => onApplyPreset(p)}
          className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-text-secondary transition-colors hover:border-accent-green/30 hover:text-accent-green"
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
