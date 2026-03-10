"use client";

import { Slider } from "@/components/ui/slider";

import { labelStyle } from "./games-controls-shared";

interface QueensControlsProps {
  queensN: number;
  setQueensN: (v: number) => void;
  onNChange: (n: number) => void;
}

export function QueensControls({
  queensN,
  setQueensN,
  onNChange,
}: QueensControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={labelStyle}>N:</span>
      <div className="flex w-28 items-center gap-1.5">
        <Slider
          min={4}
          max={12}
          step={1}
          value={[queensN]}
          onValueChange={([v]) => {
            setQueensN(v);
            onNChange(v);
          }}
          className="flex-1"
        />
        <span className="w-5 text-right font-mono text-xs text-text-primary">
          {queensN}
        </span>
      </div>
    </div>
  );
}
