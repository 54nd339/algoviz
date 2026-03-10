import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SearchStep } from "./types";

export const binarySearchMeta: AlgorithmMeta = {
  id: "binary-search",
  name: "Binary Search",
  category: "searching",
  description:
    "Repeatedly divides a sorted array in half, comparing the target with the middle element to eliminate half the remaining elements each step.",
  timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
  spaceComplexity: "O(1)",
  pseudocode: `function binarySearch(arr, target):
  left = 0
  right = arr.length - 1
  while left <= right:
    mid = floor((left + right) / 2)
    if arr[mid] == target:
      return mid
    else if arr[mid] < target:
      left = mid + 1
    else:
      right = mid - 1
  return -1`,
  presets: [
    {
      name: "Target in Middle",
      generator: () => {
        const arr = Array.from({ length: 20 }, (_, i) => i * 5 + 5);
        return { array: arr, target: arr[10] };
      },
      expectedCase: "best",
    },
    {
      name: "Target at Boundary",
      generator: () => {
        const arr = Array.from({ length: 20 }, (_, i) => i * 5 + 5);
        return { array: arr, target: arr[0] };
      },
      expectedCase: "worst",
    },
    {
      name: "Target Absent",
      generator: () => ({
        array: Array.from({ length: 20 }, (_, i) => i * 5 + 5),
        target: 42,
      }),
      expectedCase: "worst",
    },
    {
      name: "Random Sorted (30)",
      generator: () => {
        const arr = Array.from({ length: 30 }, (_, i) => i * 3 + 1);
        const target = arr[Math.floor(Math.random() * arr.length)];
        return { array: arr, target };
      },
      expectedCase: "random",
    },
  ],
  misconceptions: [
    {
      myth: "Binary search works on any array.",
      reality:
        "Binary search requires the array to be sorted. Using it on unsorted data produces incorrect results.",
    },
  ],
  relatedAlgorithms: ["linear-search", "jump-search", "exponential-search"],
};

registerAlgorithm(binarySearchMeta);

export function* binarySearch(input: {
  array: number[];
  target: number;
}): AlgorithmGenerator<SearchStep> {
  const { array, target } = input;
  const arr = [...array];
  const n = arr.length;
  let left = 0;
  let right = n - 1;
  const eliminated: number[] = [];
  let comparisons = 0;

  yield {
    type: "init",
    data: {
      array: [...arr],
      target,
      left,
      right,
      eliminated: [],
      comparisons: 0,
    },
    description: `Binary searching for target=${target} in sorted array of ${n} elements`,
    codeLine: 1,
    variables: { target, left, right, n },
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
      description: `Checking mid=${mid}, arr[${mid}]=${arr[mid]} vs target=${target}`,
      codeLine: 5,
      variables: {
        left,
        right,
        mid,
        "arr[mid]": arr[mid],
        target,
        comparisons,
      },
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
        codeLine: 6,
        variables: { mid, comparisons },
      };
      return;
    }

    if (arr[mid] < target) {
      for (let i = left; i <= mid; i++) {
        if (!eliminated.includes(i)) eliminated.push(i);
      }
      left = mid + 1;

      yield {
        type: "narrow",
        data: {
          array: [...arr],
          target,
          left,
          right,
          eliminated: [...eliminated],
          comparisons,
        },
        description: `arr[${mid}]=${arr[mid]} < ${target}: search right half [${left}..${right}]`,
        codeLine: 8,
        variables: { left, right, mid, "arr[mid]": arr[mid] },
        reasoning:
          "Target is larger than middle element, so it must be in the right half.",
      };
    } else {
      for (let i = mid; i <= right; i++) {
        if (!eliminated.includes(i)) eliminated.push(i);
      }
      right = mid - 1;

      yield {
        type: "narrow",
        data: {
          array: [...arr],
          target,
          left,
          right,
          eliminated: [...eliminated],
          comparisons,
        },
        description: `arr[${mid}]=${arr[mid]} > ${target}: search left half [${left}..${right}]`,
        codeLine: 10,
        variables: { left, right, mid, "arr[mid]": arr[mid] },
        reasoning:
          "Target is smaller than middle element, so it must be in the left half.",
      };
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
    codeLine: 12,
    variables: { comparisons },
  };
}
