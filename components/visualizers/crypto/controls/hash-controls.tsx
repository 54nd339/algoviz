"use client";

import { Button } from "@/components/ui";
import { controlInputStyle, controlLabelStyle } from "@/components/visualizers/shared/control-styles";

const inputStyle = controlInputStyle;
const labelStyle = controlLabelStyle;

interface HashControlsProps {
  visible: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onApply: () => void;
}

export function HashControls({
  visible,
  input,
  onInputChange,
  onApply,
}: HashControlsProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={labelStyle}>Input string:</span>
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onApply();
        }}
        className={`${inputStyle} w-44`}
      />
      <Button variant="outline" size="sm" onClick={onApply}>
        Apply
      </Button>
    </div>
  );
}
