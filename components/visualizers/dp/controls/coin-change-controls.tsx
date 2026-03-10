"use client";

import { Slider } from "@/components/ui";

import { DP_INPUT_CLASS } from "./dp-controls-shared";

interface CoinChangeControlsProps {
  coins: string;
  onCoinsChange: (v: string) => void;
  amount: number;
  onAmountChange: (v: number) => void;
}

export function CoinChangeControls({
  coins,
  onCoinsChange,
  amount,
  onAmountChange,
}: CoinChangeControlsProps) {
  return (
    <>
      <input
        value={coins}
        onChange={(e) => onCoinsChange(e.target.value)}
        className={DP_INPUT_CLASS}
        placeholder="Coins (e.g. 1,3,4)"
      />
      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] text-text-muted">
          amt={amount}
        </span>
        <Slider
          value={[amount]}
          min={1}
          max={30}
          step={1}
          onValueChange={([v]) => onAmountChange(v)}
          className="w-16"
          aria-label="Target amount"
        />
      </div>
    </>
  );
}
