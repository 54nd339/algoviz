"use client";

import { DP_INPUT_CLASS } from "./dp-controls-shared";

interface StringDPControlsProps {
  str1: string;
  onStr1Change: (v: string) => void;
  str2: string;
  onStr2Change: (v: string) => void;
}

/** Shared controls for LCS and Edit Distance (both use two strings). */
export function StringDPControls({
  str1,
  onStr1Change,
  str2,
  onStr2Change,
}: StringDPControlsProps) {
  return (
    <>
      <input
        value={str1}
        onChange={(e) => onStr1Change(e.target.value)}
        className={DP_INPUT_CLASS}
        placeholder="String 1"
      />
      <input
        value={str2}
        onChange={(e) => onStr2Change(e.target.value)}
        className={DP_INPUT_CLASS}
        placeholder="String 2"
      />
    </>
  );
}
