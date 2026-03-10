import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

export const insertionSortMeta: AlgorithmMeta = {
  id: "insertion-sort",
  name: "Insertion Sort",
  category: "sorting",
  description:
    "Builds the final sorted array one item at a time by repeatedly picking the next item and inserting it into its correct position among the previously sorted items.",
  timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
  spaceComplexity: "O(1)",
  stable: true,
  inPlace: true,
  pseudocode: `function insertionSort(arr):
  for i = 1 to arr.length - 1:
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
      arr[j + 1] = arr[j]
      j = j - 1
    arr[j + 1] = key`,
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
      name: "Nearly Sorted (20)",
      generator: (ctx) => {
        const n = ctx?.arraySize ?? 20;
        const arr = Array.from({ length: n }, (_, i) => i + 1);
        arr[Math.min(3, n - 1)] = Math.min(18, n);
        arr[Math.min(17, n - 1)] = 4;
        return arr;
      },
      expectedCase: "best",
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
      myth: "Insertion sort is never practical for real-world use.",
      reality:
        "Insertion sort is excellent for small arrays (< 20 elements) and nearly sorted data. Tim Sort uses it internally for small runs.",
    },
  ],
  relatedAlgorithms: ["bubble-sort", "shell-sort", "tim-sort"],
};

registerAlgorithm(insertionSortMeta);

export function* insertionSort(input: number[]): AlgorithmGenerator<SortStep> {
  const arr = [...input];
  const n = arr.length;
  const sorted: number[] = [0];
  let comparisons = 0;
  let swaps = 0;
  let arrayAccesses = 0;

  yield {
    type: "init",
    data: {
      array: [...arr],
      sorted: [0],
      comparisons: 0,
      swaps: 0,
      arrayAccesses: 0,
    },
    description: "First element is trivially sorted",
    codeLine: 1,
    variables: { n },
  };

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    arrayAccesses++;
    let j = i - 1;

    yield {
      type: "pick",
      data: {
        array: [...arr],
        comparing: [i, j],
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Picking key=${key} at index ${i} to insert into sorted portion`,
      codeLine: 3,
      variables: { i, key, j },
    };

    while (j >= 0 && arr[j] > key) {
      comparisons++;
      arrayAccesses += 2;
      arr[j + 1] = arr[j];
      swaps++;

      yield {
        type: "shift",
        data: {
          array: [...arr],
          swapping: [j, j + 1],
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `Shifting arr[${j}]=${arr[j]} right to make room for key=${key}`,
        codeLine: 6,
        variables: { i, key, j, "arr[j]": arr[j] },
      };

      j--;
    }

    if (j >= 0) {
      comparisons++;
      arrayAccesses++;
    }

    arr[j + 1] = key;
    arrayAccesses++;

    sorted.push(i);
    sorted.sort((a, b) => a - b);

    yield {
      type: "insert",
      data: {
        array: [...arr],
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Inserted key=${key} at position ${j + 1}`,
      codeLine: 8,
      variables: { i, key, position: j + 1 },
    };
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
    description: `Sorting complete! ${comparisons} comparisons, ${swaps} shifts`,
    variables: { comparisons, swaps, arrayAccesses },
  };
}
