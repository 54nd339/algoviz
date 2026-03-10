import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SearchStep } from "./types";

export const exponentialSearchMeta: AlgorithmMeta = {
  id: "exponential-search",
  name: "Exponential Search",
  category: "searching",
  description:
    "Finds the range where the target lies by exponentially increasing the search bound, then performs a binary search within that range. Particularly efficient when the target is near the beginning.",
  timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
  spaceComplexity: "O(1)",
  pseudocode: `function exponentialSearch(arr, target):
  if arr[0] == target: return 0
  bound = 1
  while bound < n and arr[bound] < target:
    bound *= 2
  // Binary search in [bound/2, min(bound, n-1)]
  left = bound / 2
  right = min(bound, n - 1)
  return binarySearch(arr, target, left, right)`,
  presets: [
    {
      name: "Target Near Start",
      generator: () => ({
        array: Array.from({ length: 30 }, (_, i) => i * 3 + 1),
        target: 4,
      }),
      expectedCase: "best",
    },
    {
      name: "Target Near End",
      generator: () => ({
        array: Array.from({ length: 30 }, (_, i) => i * 3 + 1),
        target: 82,
      }),
      expectedCase: "average",
    },
    {
      name: "Target Absent",
      generator: () => ({
        array: Array.from({ length: 30 }, (_, i) => i * 3 + 1),
        target: 50,
      }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Exponential search is always better than binary search.",
      reality:
        "Exponential search shines when the target is close to the beginning of a large sorted array. For uniformly distributed targets, binary search performs equally well.",
    },
  ],
  relatedAlgorithms: ["binary-search", "jump-search"],
};

registerAlgorithm(exponentialSearchMeta);

export function* exponentialSearch(input: {
  array: number[];
  target: number;
}): AlgorithmGenerator<SearchStep> {
  const { array, target } = input;
  const arr = [...array];
  const n = arr.length;
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
    description: `Exponential searching for target=${target}`,
    codeLine: 1,
    variables: { target, n },
  };

  // Check first element
  comparisons++;
  if (arr[0] === target) {
    yield {
      type: "found",
      data: {
        array: [...arr],
        target,
        left: 0,
        right: 0,
        current: 0,
        found: 0,
        eliminated: [],
        comparisons,
      },
      description: `Found target=${target} at index 0`,
      codeLine: 2,
      variables: { comparisons },
    };
    return;
  }

  // Exponential expansion phase
  let bound = 1;
  while (bound < n && arr[bound] < target) {
    comparisons++;

    yield {
      type: "expand",
      data: {
        array: [...arr],
        target,
        left: Math.floor(bound / 2),
        right: Math.min(bound, n - 1),
        current: bound,
        eliminated: [...eliminated],
        comparisons,
      },
      description: `Expanding: arr[${bound}]=${arr[bound]} < ${target}, doubling bound`,
      codeLine: 4,
      variables: { bound, "arr[bound]": arr[bound] },
    };

    for (let i = Math.floor(bound / 2); i < bound; i++) {
      if (!eliminated.includes(i)) eliminated.push(i);
    }

    bound *= 2;
  }

  if (bound < n) {
    comparisons++;
  }

  // Binary search within [bound/2, min(bound, n-1)]
  let left = Math.floor(bound / 2);
  let right = Math.min(bound, n - 1);

  yield {
    type: "range-found",
    data: {
      array: [...arr],
      target,
      left,
      right,
      eliminated: [...eliminated],
      comparisons,
    },
    description: `Target in range [${left}..${right}], starting binary search`,
    codeLine: 6,
    variables: { left, right },
    reasoning:
      "Exponential expansion found the range, now binary search narrows it down.",
  };

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    yield {
      type: "check",
      data: {
        array: [...arr],
        target,
        left,
        right,
        mid,
        current: mid,
        eliminated: [...eliminated],
        comparisons,
      },
      description: `Binary search: arr[${mid}]=${arr[mid]} vs target=${target}`,
      codeLine: 8,
      variables: { left, right, mid, "arr[mid]": arr[mid], comparisons },
    };

    if (arr[mid] === target) {
      yield {
        type: "found",
        data: {
          array: [...arr],
          target,
          left,
          right,
          mid,
          current: mid,
          found: mid,
          eliminated: [...eliminated],
          comparisons,
        },
        description: `Found target=${target} at index ${mid} in ${comparisons} comparisons`,
        codeLine: 8,
        variables: { mid, comparisons },
      };
      return;
    }

    if (arr[mid] < target) {
      for (let i = left; i <= mid; i++) {
        if (!eliminated.includes(i)) eliminated.push(i);
      }
      left = mid + 1;
    } else {
      for (let i = mid; i <= right; i++) {
        if (!eliminated.includes(i)) eliminated.push(i);
      }
      right = mid - 1;
    }
  }

  yield {
    type: "not-found",
    data: {
      array: [...arr],
      target,
      left,
      right,
      found: -1,
      eliminated: [...eliminated],
      comparisons,
    },
    description: `Target=${target} not found after ${comparisons} comparisons`,
    codeLine: 8,
    variables: { comparisons },
  };
}
