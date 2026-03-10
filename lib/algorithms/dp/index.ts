export { coinChange, coinChangeMeta } from "./coin-change";
export { editDistance, editDistanceMeta } from "./edit-distance";
export { fibonacciDP, fibonacciMeta } from "./fibonacci";
export { knapsack, knapsackMeta } from "./knapsack";
export { lcs, lcsMeta } from "./lcs";
export { matrixChain, matrixChainMeta } from "./matrix-chain";
export type { DPStep, FibStep, FibTreeNode } from "./types";

import type { AlgorithmStep } from "@/types";

import { coinChange } from "./coin-change";
import { editDistance } from "./edit-distance";
import { fibonacciDP } from "./fibonacci";
import { knapsack } from "./knapsack";
import { lcs } from "./lcs";
import { matrixChain } from "./matrix-chain";
import type { DPStep } from "./types";
import type { FibStep } from "./types";

export const DP_GENERATORS: Record<
  string,
  (
    input: unknown,
  ) => Generator<AlgorithmStep<DPStep | FibStep>, void, undefined>
> = {
  "fibonacci-dp": (input) =>
    fibonacciDP(input as { n: number; mode: "naive" | "dp" }),
  "knapsack-dp": (input) =>
    knapsack(
      input as { weights: number[]; values: number[]; capacity: number },
    ),
  "lcs-dp": (input) => lcs(input as { str1: string; str2: string }),
  "edit-distance-dp": (input) =>
    editDistance(input as { str1: string; str2: string }),
  "coin-change-dp": (input) =>
    coinChange(input as { coins: number[]; amount: number }),
  "matrix-chain-dp": (input) => matrixChain(input as { dimensions: number[] }),
};
