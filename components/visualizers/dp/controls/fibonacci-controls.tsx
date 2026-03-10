"use client";

import { Slider } from "@/components/ui";
import { cn } from "@/lib/utils";

interface FibonacciControlsProps {
  fibN: number;
  onFibNChange: (v: number) => void;
  fibMode: "dp" | "naive";
  onFibModeChange: (m: "dp" | "naive") => void;
}

export function FibonacciControls({
  fibN,
  onFibNChange,
  fibMode,
  onFibModeChange,
}: FibonacciControlsProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-text-muted">n={fibN}</span>
        <Slider
          value={[fibN]}
          min={2}
          max={fibMode === "naive" ? 10 : 20}
          step={1}
          onValueChange={([v]) => onFibNChange(v)}
          className="w-20"
          aria-label="Fibonacci n"
        />
      </div>
      <div className="flex items-center gap-1.5 rounded border border-border px-2 py-0.5">
        <button
          onClick={() => onFibModeChange("dp")}
          className={cn(
            "rounded px-2 py-0.5 font-mono text-[10px] transition-colors",
            fibMode === "dp"
              ? "bg-green-400/20 text-green-400"
              : "text-text-muted hover:text-text-primary",
          )}
        >
          DP Table
        </button>
        <button
          onClick={() => onFibModeChange("naive")}
          className={cn(
            "rounded px-2 py-0.5 font-mono text-[10px] transition-colors",
            fibMode === "naive"
              ? "bg-red-400/20 text-red-400"
              : "text-text-muted hover:text-text-primary",
          )}
        >
          Naive Tree
        </button>
      </div>
    </>
  );
}
