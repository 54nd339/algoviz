"use client";

import { Slider } from "@/components/ui";

import { DP_INPUT_CLASS } from "./dp-controls-shared";

interface KnapsackControlsProps {
  weights: string;
  onWeightsChange: (v: string) => void;
  values: string;
  onValuesChange: (v: string) => void;
  capacity: number;
  onCapacityChange: (v: number) => void;
}

export function KnapsackControls({
  weights,
  onWeightsChange,
  values,
  onValuesChange,
  capacity,
  onCapacityChange,
}: KnapsackControlsProps) {
  return (
    <>
      <input
        value={weights}
        onChange={(e) => onWeightsChange(e.target.value)}
        className={DP_INPUT_CLASS}
        placeholder="Weights"
        title="Comma-separated weights"
      />
      <input
        value={values}
        onChange={(e) => onValuesChange(e.target.value)}
        className={DP_INPUT_CLASS}
        placeholder="Values"
        title="Comma-separated values"
      />
      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] text-text-muted">
          W={capacity}
        </span>
        <Slider
          value={[capacity]}
          min={1}
          max={20}
          step={1}
          onValueChange={([v]) => onCapacityChange(v)}
          className="w-16"
          aria-label="Knapsack capacity"
        />
      </div>
    </>
  );
}
