"use client";

import { Slider } from "@/components/ui";

const SEGMENTS_MIN = 2;
const SEGMENTS_MAX = 50;

interface IntegrationControlsProps {
  segments: number;
  onSegmentsChange: (value: number) => void;
}

/** Segments slider for numerical integration (trapezoidal rule). */
export function IntegrationControls({
  segments,
  onSegmentsChange,
}: IntegrationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-text-muted">
        segments={segments}
      </span>
      <Slider
        value={[segments]}
        min={SEGMENTS_MIN}
        max={SEGMENTS_MAX}
        step={1}
        onValueChange={([value]) => onSegmentsChange(value)}
        className="w-24"
        aria-label="Number of segments"
      />
    </div>
  );
}
