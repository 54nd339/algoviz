"use client";

import { Button } from "@/components/ui";
import { controlInputStyle, controlLabelStyle } from "@/components/visualizers/shared/control-styles";
import { cn } from "@/lib/utils";

const inputStyle = controlInputStyle;
const labelStyle = controlLabelStyle;

interface DHControlsProps {
  visible: boolean;
  p: number;
  g: number;
  a: number;
  b: number;
  onPChange: (v: number) => void;
  onGChange: (v: number) => void;
  onAChange: (v: number) => void;
  onBChange: (v: number) => void;
  onApply: () => void;
}

export function DHControls({
  visible,
  p,
  g,
  a,
  b,
  onPChange,
  onGChange,
  onAChange,
  onBChange,
  onApply,
}: DHControlsProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={labelStyle}>p (prime):</span>
      <input
        type="number"
        min={2}
        value={p}
        onChange={(e) => onPChange(Number(e.target.value) || 23)}
        className={cn(inputStyle, "w-16 text-center")}
      />
      <span className={labelStyle}>g (generator):</span>
      <input
        type="number"
        min={2}
        value={g}
        onChange={(e) => onGChange(Number(e.target.value) || 5)}
        className={cn(inputStyle, "w-14 text-center")}
      />
      <span className={labelStyle}>a (Alice secret):</span>
      <input
        type="number"
        min={1}
        value={a}
        onChange={(e) => onAChange(Number(e.target.value) || 6)}
        className={cn(inputStyle, "w-14 text-center")}
      />
      <span className={labelStyle}>b (Bob secret):</span>
      <input
        type="number"
        min={1}
        value={b}
        onChange={(e) => onBChange(Number(e.target.value) || 15)}
        className={cn(inputStyle, "w-14 text-center")}
      />
      <Button variant="outline" size="sm" onClick={onApply}>
        Apply
      </Button>
    </div>
  );
}
