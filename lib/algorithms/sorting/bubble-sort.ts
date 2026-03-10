import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

export const bubbleSortMeta: AlgorithmMeta = {
  id: "bubble-sort",
  name: "Bubble Sort",
  category: "sorting",
  description:
    "Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.",
  timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
  spaceComplexity: "O(1)",
  stable: true,
  inPlace: true,
  pseudocode: `function bubbleSort(arr):
  n = arr.length
  for i = 0 to n - 1:
    swapped = false
    for j = 0 to n - i - 2:
      if arr[j] > arr[j + 1]:
        swap(arr[j], arr[j + 1])
        swapped = true
    if not swapped:
      break`,
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
    {
      name: "Nearly Sorted (20)",
      generator: (ctx) => {
        const n = ctx?.arraySize ?? 20;
        const arr = Array.from({ length: n }, (_, i) => i + 1);
        const i1 = Math.min(15, Math.floor((n * 15) / 20));
        const i2 = Math.min(4, Math.floor((n * 4) / 20));
        arr[i1] = 5;
        arr[i2] = Math.min(16, n);
        return arr;
      },
      expectedCase: "best",
    },
  ],
  misconceptions: [
    {
      myth: "Bubble sort is always the slowest sorting algorithm.",
      reality:
        "On nearly sorted data, optimized bubble sort with early termination runs in O(n), which can beat algorithms like heap sort.",
    },
  ],
  relatedAlgorithms: ["selection-sort", "insertion-sort"],
};

registerAlgorithm(bubbleSortMeta);

export function* bubbleSort(input: number[]): AlgorithmGenerator<SortStep> {
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
    variables: { n, i: 0, j: 0 },
  };

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      arrayAccesses += 2;
      comparisons++;

      yield {
        type: "compare",
        data: {
          array: [...arr],
          comparing: [j, j + 1],
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `Comparing arr[${j}]=${arr[j]} with arr[${j + 1}]=${arr[j + 1]}`,
        codeLine: 5,
        variables: { i, j, swapped, "arr[j]": arr[j], "arr[j+1]": arr[j + 1] },
      };

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        arrayAccesses += 2;
        swapped = true;

        yield {
          type: "swap",
          data: {
            array: [...arr],
            swapping: [j, j + 1],
            sorted: [...sorted],
            comparisons,
            swaps,
            arrayAccesses,
          },
          description: `Swapping ${arr[j + 1]} and ${arr[j]}`,
          codeLine: 6,
          variables: {
            i,
            j,
            swapped: true,
            "arr[j]": arr[j],
            "arr[j+1]": arr[j + 1],
          },
        };
      }
    }

    sorted.push(n - i - 1);

    if (!swapped) {
      for (let k = 0; k < n - i - 1; k++) {
        if (!sorted.includes(k)) sorted.push(k);
      }

      yield {
        type: "early-exit",
        data: {
          array: [...arr],
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description:
          "No swaps in this pass — array is sorted, terminating early",
        codeLine: 9,
        variables: { i, swapped: false },
        reasoning:
          "The early termination optimization detects when the array is already sorted.",
      };
      break;
    }
  }

  const allSorted = Array.from({ length: n }, (_, i) => i);
  yield {
    type: "done",
    data: {
      array: [...arr],
      sorted: allSorted,
      comparisons,
      swaps,
      arrayAccesses,
    },
    description: `Sorting complete! ${comparisons} comparisons, ${swaps} swaps`,
    variables: { comparisons, swaps, arrayAccesses },
  };
}
