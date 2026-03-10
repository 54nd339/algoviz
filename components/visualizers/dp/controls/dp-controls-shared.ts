/** Default input per DP algorithm, used when presets/picker don't provide one. */
export function defaultInputForAlgorithm(id: string): unknown {
  switch (id) {
    case "fibonacci-dp":
      return { n: 7, mode: "dp" };
    case "knapsack-dp":
      return { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 };
    case "lcs-dp":
      return { str1: "ABCBDAB", str2: "BDCAB" };
    case "edit-distance-dp":
      return { str1: "kitten", str2: "sitting" };
    case "coin-change-dp":
      return { coins: [1, 3, 4], amount: 6 };
    case "matrix-chain-dp":
      return { dimensions: [10, 30, 5, 60] };
    default:
      return {};
  }
}

import { controlInputStyle } from "@/components/visualizers/shared/control-styles";
import { cn } from "@/lib/utils";

export const DP_INPUT_CLASS = cn(controlInputStyle, "w-28 text-left placeholder:text-text-muted focus:border-accent-cyan");

export function isKnapsackInput(
  input: unknown,
): input is { weights: number[]; values: number[]; capacity: number } {
  const o = input as Record<string, unknown>;
  return (
    Array.isArray(o?.weights) &&
    Array.isArray(o?.values) &&
    typeof o?.capacity === "number"
  );
}
