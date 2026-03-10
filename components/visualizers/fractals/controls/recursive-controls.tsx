"use client";

import { Slider } from "@/components/ui";
import { cn } from "@/lib/utils";

interface RecursiveControlsProps {
  depth: number;
  onDepthChange: (d: number) => void;
  className?: string;
}

export function RecursiveControls({
  depth,
  onDepthChange,
  className,
}: RecursiveControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-mono text-[10px] text-text-muted">depth={depth}</span>
      <Slider
        value={[depth]}
        min={0}
        max={8}
        step={1}
        onValueChange={([v]) => onDepthChange(v)}
        className="w-24"
        aria-label="Recursion depth"
      />
    </div>
  );
}
