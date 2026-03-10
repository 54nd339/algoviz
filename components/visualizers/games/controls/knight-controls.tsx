"use client";

import { Slider } from "@/components/ui/slider";

import { btnStyle, inputStyle, labelStyle } from "./games-controls-shared";

interface KnightControlsProps {
  knightSize: number;
  setKnightSize: (v: number) => void;
  knightRow: number;
  setKnightRow: (v: number) => void;
  knightCol: number;
  setKnightCol: (v: number) => void;
  onApply: () => void;
}

export function KnightControls({
  knightSize,
  setKnightSize,
  knightRow,
  setKnightRow,
  knightCol,
  setKnightCol,
  onApply,
}: KnightControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={labelStyle}>Size:</span>
      <div className="flex w-24 items-center gap-1.5">
        <Slider
          min={5}
          max={8}
          step={1}
          value={[knightSize]}
          onValueChange={([v]) => setKnightSize(v)}
          className="flex-1"
        />
        <span className="w-4 text-right font-mono text-xs text-text-primary">
          {knightSize}
        </span>
      </div>
      <span className={labelStyle}>Row:</span>
      <input
        type="number"
        min={0}
        max={knightSize - 1}
        value={knightRow}
        onChange={(e) =>
          setKnightRow(
            Math.max(
              0,
              Math.min(knightSize - 1, Number(e.target.value) || 0),
            ),
          )
        }
        className={inputStyle}
      />
      <span className={labelStyle}>Col:</span>
      <input
        type="number"
        min={0}
        max={knightSize - 1}
        value={knightCol}
        onChange={(e) =>
          setKnightCol(
            Math.max(
              0,
              Math.min(knightSize - 1, Number(e.target.value) || 0),
            ),
          )
        }
        className={inputStyle}
      />
      <button onClick={onApply} className={btnStyle}>
        Apply
      </button>
    </div>
  );
}
