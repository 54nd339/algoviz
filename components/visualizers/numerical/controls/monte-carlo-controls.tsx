"use client";

import { Slider } from "@/components/ui";

const SAMPLES_MIN = 100;
const SAMPLES_MAX = 2000;

interface MonteCarloControlsProps {
  numSamples: number;
  onSamplesChange: (value: number) => void;
}

/** Darts/samples slider for Monte Carlo Pi estimation. */
export function MonteCarloControls({
  numSamples,
  onSamplesChange,
}: MonteCarloControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-text-muted">
        darts={numSamples}
      </span>
      <Slider
        value={[numSamples]}
        min={SAMPLES_MIN}
        max={SAMPLES_MAX}
        step={50}
        onValueChange={([value]) => onSamplesChange(value)}
        className="w-28"
        aria-label="Number of darts"
      />
    </div>
  );
}
