import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SearchStep } from "./types";

export const jumpSearchMeta: AlgorithmMeta = {
  id: "jump-search",
  name: "Jump Search",
  category: "searching",
  description:
    "Searches a sorted array by jumping ahead by fixed steps (sqrt(n)), then performs a linear search backward in the block where the target might reside.",
  timeComplexity: { best: "O(1)", average: "O(√n)", worst: "O(√n)" },
  spaceComplexity: "O(1)",
  pseudocode: `function jumpSearch(arr, target):
  n = arr.length
  step = floor(sqrt(n))
  prev = 0
  // Jump ahead
  while arr[min(step, n) - 1] < target:
    prev = step
    step += floor(sqrt(n))
    if prev >= n: return -1
  // Linear scan in block
  for i = prev to min(step, n) - 1:
    if arr[i] == target:
      return i
  return -1`,
  presets: [
    {
      name: "Target in Block 3",
      generator: () => ({
        array: Array.from({ length: 25 }, (_, i) => i * 4 + 2),
        target: 50,
      }),
      expectedCase: "average",
    },
    {
      name: "Target at Start",
      generator: () => ({
        array: Array.from({ length: 25 }, (_, i) => i * 4 + 2),
        target: 2,
      }),
      expectedCase: "best",
    },
    {
      name: "Target Absent",
      generator: () => ({
        array: Array.from({ length: 25 }, (_, i) => i * 4 + 2),
        target: 99,
      }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Jump search is always better than linear search.",
      reality:
        "Jump search requires a sorted array and has overhead from computing the jump step. For very small arrays, linear search may be faster.",
    },
  ],
  relatedAlgorithms: ["binary-search", "linear-search", "exponential-search"],
};

registerAlgorithm(jumpSearchMeta);

export function* jumpSearch(input: {
  array: number[];
  target: number;
}): AlgorithmGenerator<SearchStep> {
  const { array, target } = input;
  const arr = [...array];
  const n = arr.length;
  const jumpStep = Math.floor(Math.sqrt(n));
  const eliminated: number[] = [];
  let comparisons = 0;

  yield {
    type: "init",
    data: {
      array: [...arr],
      target,
      left: 0,
      right: n - 1,
      eliminated: [],
      comparisons: 0,
    },
    description: `Jump searching for target=${target}, step=${jumpStep}`,
    codeLine: 1,
    variables: { target, n, step: jumpStep },
  };

  let prev = 0;
  let step = jumpStep;

  // Jump phase
  while (step < n && arr[Math.min(step, n) - 1] < target) {
    comparisons++;

    yield {
      type: "jump",
      data: {
        array: [...arr],
        target,
        left: prev,
        right: Math.min(step, n) - 1,
        current: Math.min(step, n) - 1,
        eliminated: [...eliminated],
        comparisons,
      },
      description: `Jumping: arr[${Math.min(step, n) - 1}]=${arr[Math.min(step, n) - 1]} < ${target}, skipping block`,
      codeLine: 6,
      variables: { prev, step, "arr[step-1]": arr[Math.min(step, n) - 1] },
    };

    for (let i = prev; i < Math.min(step, n); i++) {
      if (!eliminated.includes(i)) eliminated.push(i);
    }

    prev = step;
    step += jumpStep;

    if (prev >= n) {
      yield {
        type: "not-found",
        data: {
          array: [...arr],
          target,
          left: 0,
          right: n - 1,
          found: -1,
          eliminated: [...eliminated],
          comparisons,
        },
        description: `Target=${target} not found — jumped past end of array`,
        codeLine: 8,
        variables: { comparisons },
      };
      return;
    }
  }

  // Check block boundary
  if (step < n) {
    comparisons++;
  }

  yield {
    type: "block-found",
    data: {
      array: [...arr],
      target,
      left: prev,
      right: Math.min(step, n) - 1,
      eliminated: [...eliminated],
      comparisons,
    },
    description: `Target might be in block [${prev}..${Math.min(step, n) - 1}], scanning linearly`,
    codeLine: 10,
    variables: { prev, step: Math.min(step, n) },
  };

  // Linear scan in block
  for (let i = prev; i < Math.min(step, n); i++) {
    comparisons++;

    yield {
      type: "check",
      data: {
        array: [...arr],
        target,
        left: prev,
        right: Math.min(step, n) - 1,
        current: i,
        eliminated: [...eliminated],
        comparisons,
      },
      description: `Checking arr[${i}]=${arr[i]} vs target=${target}`,
      codeLine: 11,
      variables: { i, "arr[i]": arr[i], target, comparisons },
    };

    if (arr[i] === target) {
      yield {
        type: "found",
        data: {
          array: [...arr],
          target,
          left: prev,
          right: Math.min(step, n) - 1,
          current: i,
          found: i,
          eliminated: [...eliminated],
          comparisons,
        },
        description: `Found target=${target} at index ${i} in ${comparisons} comparisons`,
        codeLine: 12,
        variables: { i, comparisons },
      };
      return;
    }

    if (arr[i] > target) break;
    eliminated.push(i);
  }

  yield {
    type: "not-found",
    data: {
      array: [...arr],
      target,
      left: 0,
      right: n - 1,
      found: -1,
      eliminated: [...eliminated],
      comparisons,
    },
    description: `Target=${target} not found after ${comparisons} comparisons`,
    codeLine: 13,
    variables: { comparisons },
  };
}
