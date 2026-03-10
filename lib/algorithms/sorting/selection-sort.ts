import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

export const selectionSortMeta: AlgorithmMeta = {
  id: "selection-sort",
  name: "Selection Sort",
  category: "sorting",
  description:
    "Divides the input into a sorted and unsorted region, repeatedly selects the smallest element from the unsorted region and moves it to the end of the sorted region.",
  timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
  spaceComplexity: "O(1)",
  stable: false,
  inPlace: true,
  pseudocode: `function selectionSort(arr):
  n = arr.length
  for i = 0 to n - 1:
    minIdx = i
    for j = i + 1 to n - 1:
      if arr[j] < arr[minIdx]:
        minIdx = j
    if minIdx != i:
      swap(arr[i], arr[minIdx])`,
  presets: [
    {
      name: "Random (20)",
      generator: (ctx) =>
        Array.from(
          { length: ctx?.arraySize ?? 20 },
          () => Math.floor(Math.random() * 100) + 1,
        ),
      expectedCase: "average",
    },
    {
      name: "Reverse Sorted (20)",
      generator: (ctx) => {
        const n = ctx?.arraySize ?? 20;
        return Array.from({ length: n }, (_, i) => n - i);
      },
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Selection sort is stable.",
      reality:
        "Selection sort is not stable because it swaps non-adjacent elements, which can change the relative order of equal elements.",
    },
  ],
  relatedAlgorithms: ["bubble-sort", "insertion-sort"],
};

registerAlgorithm(selectionSortMeta);

export function* selectionSort(input: number[]): AlgorithmGenerator<SortStep> {
  const arr = [...input];
  const n = arr.length;
  const sorted: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  let arrayAccesses = 0;

  yield {
    type: "init",
    data: {
      array: [...arr],
      sorted: [],
      comparisons: 0,
      swaps: 0,
      arrayAccesses: 0,
    },
    description: "Initial array state",
    codeLine: 1,
    variables: { n },
  };

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      arrayAccesses += 2;
      comparisons++;

      yield {
        type: "compare",
        data: {
          array: [...arr],
          comparing: [j, minIdx],
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `Comparing arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}`,
        codeLine: 5,
        variables: {
          i,
          j,
          minIdx,
          "arr[j]": arr[j],
          "arr[minIdx]": arr[minIdx],
        },
      };

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;
      arrayAccesses += 2;

      yield {
        type: "swap",
        data: {
          array: [...arr],
          swapping: [i, minIdx],
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `Swapping arr[${i}] and arr[${minIdx}] — placing ${arr[i]} in sorted position`,
        codeLine: 8,
        variables: { i, minIdx, "arr[i]": arr[i] },
      };
    }

    sorted.push(i);
  }

  sorted.push(n - 1);
  yield {
    type: "done",
    data: {
      array: [...arr],
      sorted: [...sorted],
      comparisons,
      swaps,
      arrayAccesses,
    },
    description: `Sorting complete! ${comparisons} comparisons, ${swaps} swaps`,
    variables: { comparisons, swaps, arrayAccesses },
  };
}
