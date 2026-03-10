"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { L_SYSTEM_PRESETS } from "@/lib/algorithms/fractals";
import { cn } from "@/lib/utils";

interface LSystemControlsProps {
  lSystemPresetIndex: number;
  onLSystemPresetChange: (idx: number) => void;
  className?: string;
}

export function LSystemControls({
  lSystemPresetIndex,
  onLSystemPresetChange,
  className,
}: LSystemControlsProps) {
  return (
    <Select
      value={String(lSystemPresetIndex)}
      onValueChange={(v) => onLSystemPresetChange(Number(v))}
    >
      <SelectTrigger className={cn("w-40", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {L_SYSTEM_PRESETS.map((p, i) => (
          <SelectItem key={i} value={String(i)}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
