import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SearchStep } from "./types";

export const linearSearchMeta: AlgorithmMeta = {
  id: "linear-search",
  name: "Linear Search",
  category: "searching",
  description:
    "Sequentially checks each element of the list until a match is found or the whole list has been searched. Works on unsorted arrays.",
  timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  pseudocode: `function linearSearch(arr, target):
  for i = 0 to arr.length - 1:
    if arr[i] == target:
      return i
  return -1`,
  presets: [
    {
      name: "Target at Start",
      generator: () => ({
        array: Array.from({ length: 20 }, (_, i) => (i + 1) * 3),
        target: 3,
      }),
      expectedCase: "best",
    },
    {
      name: "Target at End",
      generator: () => ({
        array: Array.from({ length: 20 }, (_, i) => (i + 1) * 3),
        target: 60,
      }),
      expectedCase: "worst",
    },
    {
      name: "Target Absent",
      generator: () => ({
        array: Array.from({ length: 20 }, (_, i) => (i + 1) * 2),
        target: 41,
      }),
      expectedCase: "worst",
    },
    {
      name: "Random",
      generator: () => {
        const arr = Array.from(
          { length: 20 },
          () => Math.floor(Math.random() * 100) + 1,
        );
        const target = arr[Math.floor(Math.random() * arr.length)];
        return { array: arr, target };
      },
      expectedCase: "random",
    },
  ],
  misconceptions: [
    {
      myth: "Linear search is never useful because binary search is always better.",
      reality:
        "Linear search works on unsorted data and has no preprocessing cost. For small arrays or single lookups in unsorted data, it's often the most practical choice.",
    },
  ],
  relatedAlgorithms: ["binary-search", "jump-search"],
};

registerAlgorithm(linearSearchMeta);

export function* linearSearch(input: {
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
    description: `Searching for target=${target} in array of ${n} elements`,
    codeLine: 1,
    variables: { target, n },
  };

  for (let i = 0; i < n; i++) {
    comparisons++;

    yield {
      type: "check",
      data: {
        array: [...arr],
        target,
        left: 0,
        right: n - 1,
        current: i,
        eliminated: [...eliminated],
        comparisons,
      },
      description: `Checking arr[${i}]=${arr[i]} against target=${target}`,
      codeLine: 2,
      variables: { i, "arr[i]": arr[i], target, comparisons },
    };

    if (arr[i] === target) {
      yield {
        type: "found",
        data: {
          array: [...arr],
          target,
          left: 0,
          right: n - 1,
          current: i,
          found: i,
          eliminated: [...eliminated],
          comparisons,
        },
        description: `Found target=${target} at index ${i} after ${comparisons} comparisons`,
        codeLine: 3,
        variables: { i, comparisons },
      };
      return;
    }

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
    codeLine: 5,
    variables: { comparisons },
  };
}
