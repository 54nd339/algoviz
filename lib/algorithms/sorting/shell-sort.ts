import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

export const shellSortMeta: AlgorithmMeta = {
  id: "shell-sort",
  name: "Shell Sort",
  category: "sorting",
  description:
    "A generalization of insertion sort that allows the exchange of items that are far apart. Uses a decreasing gap sequence to progressively reduce disorder before a final insertion sort pass.",
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n^(4/3))",
    worst: "O(n^(3/2))",
  },
  spaceComplexity: "O(1)",
  stable: false,
  inPlace: true,
  pseudocode: `function shellSort(arr):
  n = arr.length
  gap = floor(n / 2)
  while gap > 0:
    for i = gap to n - 1:
      temp = arr[i]
      j = i
      while j >= gap and arr[j - gap] > temp:
        arr[j] = arr[j - gap]
        j = j - gap
      arr[j] = temp
    gap = floor(gap / 2)`,
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
      myth: "Shell sort is just insertion sort with bigger gaps.",
      reality:
        "While Shell sort uses insertion sort as a subroutine, the gap sequence fundamentally changes the algorithm's behavior, achieving sub-quadratic time for many sequences.",
    },
  ],
  relatedAlgorithms: ["insertion-sort"],
};

registerAlgorithm(shellSortMeta);

export function* shellSort(input: number[]): AlgorithmGenerator<SortStep> {
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

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    yield {
      type: "gap",
      data: {
        array: [...arr],
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Starting pass with gap=${gap}`,
      codeLine: 4,
      variables: { gap },
    };

    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      arrayAccesses++;
      let j = i;

      while (j >= gap) {
        arrayAccesses++;
        comparisons++;

        if (arr[j - gap] <= temp) break;

        yield {
          type: "compare",
          data: {
            array: [...arr],
            comparing: [j, j - gap],
            sorted: [...sorted],
            comparisons,
            swaps,
            arrayAccesses,
          },
          description: `Gap=${gap}: arr[${j - gap}]=${arr[j - gap]} > temp=${temp}, shifting`,
          codeLine: 8,
          variables: { gap, i, j, temp, "arr[j-gap]": arr[j - gap] },
        };

        arr[j] = arr[j - gap];
        arrayAccesses += 2;
        swaps++;
        j -= gap;

        yield {
          type: "shift",
          data: {
            array: [...arr],
            swapping: [j, j + gap],
            sorted: [...sorted],
            comparisons,
            swaps,
            arrayAccesses,
          },
          description: `Shifted arr[${j + gap}] to arr[${j + gap}]`,
          codeLine: 9,
          variables: { gap, i, j, temp },
        };
      }

      arr[j] = temp;
      arrayAccesses++;
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
    description: `Sorting complete! ${comparisons} comparisons, ${swaps} shifts`,
    variables: { comparisons, swaps, arrayAccesses },
  };
}
