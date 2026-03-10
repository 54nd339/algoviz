"use client";

import { btnStyle, inputStyle, labelStyle } from "./games-controls-shared";

interface LifeControlsProps {
  lifeRows: number;
  setLifeRows: (v: number) => void;
  lifeCols: number;
  setLifeCols: (v: number) => void;
  lifeGens: number;
  setLifeGens: (v: number) => void;
  onApply: () => void;
}

export function LifeControls({
  lifeRows,
  setLifeRows,
  lifeCols,
  setLifeCols,
  lifeGens,
  setLifeGens,
  onApply,
}: LifeControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={labelStyle}>Rows:</span>
      <input
          type="number"
          min={5}
          max={80}
          value={lifeRows}
          onChange={(e) =>
            setLifeRows(
              Math.max(5, Math.min(80, Number(e.target.value) || 30)),
            )
          }
        className={inputStyle}
      />
      <span className={labelStyle}>Cols:</span>
      <input
          type="number"
          min={5}
          max={80}
          value={lifeCols}
          onChange={(e) =>
            setLifeCols(
              Math.max(5, Math.min(80, Number(e.target.value) || 30)),
            )
          }
        className={inputStyle}
      />
      <span className={labelStyle}>Gens:</span>
      <input
          type="number"
          min={1}
          max={5000}
          value={lifeGens}
          onChange={(e) =>
            setLifeGens(
              Math.max(1, Math.min(5000, Number(e.target.value) || 60)),
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
