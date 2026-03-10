import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

export const radixSortMeta: AlgorithmMeta = {
  id: "radix-sort",
  name: "Radix Sort",
  category: "sorting",
  description:
    "Sorts integers by processing individual digits, from least significant to most significant (LSD). Uses counting sort as a subroutine for each digit position.",
  timeComplexity: { best: "O(nk)", average: "O(nk)", worst: "O(nk)" },
  spaceComplexity: "O(n + k)",
  stable: true,
  inPlace: false,
  pseudocode: `function radixSort(arr):
  max = getMax(arr)
  for exp = 1; max/exp > 0; exp *= 10:
    countingSortByDigit(arr, exp)

function countingSortByDigit(arr, exp):
  count[0..9] = 0
  for each element in arr:
    digit = (element / exp) % 10
    count[digit]++
  compute prefix sums of count
  build output array using count
  copy output back to arr`,
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
      name: "Large Values (15)",
      generator: (ctx) =>
        Array.from(
          { length: ctx?.arraySize ?? 15 },
          () => Math.floor(Math.random() * 999) + 1,
        ),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Radix sort is always faster than comparison-based sorts.",
      reality:
        "Radix sort is O(nk) where k is the number of digits. For very large numbers, k can make it slower than O(n log n) comparison sorts.",
    },
  ],
  relatedAlgorithms: ["counting-sort"],
};

registerAlgorithm(radixSortMeta);

export function* radixSort(input: number[]): AlgorithmGenerator<SortStep> {
  const arr = [...input];
  const n = arr.length;
  const comparisons = 0;
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

  const max = Math.max(...arr);
  arrayAccesses += n;

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);

    yield {
      type: "digit-pass",
      data: {
        array: [...arr],
        sorted: [],
        buckets: buckets.map((b) => [...b]),
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Processing ${exp === 1 ? "ones" : exp === 10 ? "tens" : exp === 100 ? "hundreds" : `${exp}s`} digit`,
      codeLine: 3,
      variables: { exp, max },
    };

    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      buckets[digit].push(arr[i]);
      arrayAccesses++;

      yield {
        type: "distribute",
        data: {
          array: [...arr],
          comparing: [i, -1],
          sorted: [],
          buckets: buckets.map((b) => [...b]),
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `arr[${i}]=${arr[i]} → bucket ${digit}`,
        codeLine: 8,
        variables: { i, "arr[i]": arr[i], digit, exp },
      };
    }

    let idx = 0;
    for (let d = 0; d < 10; d++) {
      for (const val of buckets[d]) {
        arr[idx] = val;
        arrayAccesses++;
        swaps++;
        idx++;
      }
    }

    yield {
      type: "collect",
      data: {
        array: [...arr],
        sorted: [],
        buckets: buckets.map((b) => [...b]),
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Collected from buckets after ${exp === 1 ? "ones" : exp === 10 ? "tens" : exp === 100 ? "hundreds" : `${exp}s`} digit pass`,
      codeLine: 12,
      variables: { exp },
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
    description: `Sorting complete! ${swaps} writes, no comparisons (non-comparison sort)`,
    variables: { comparisons, swaps, arrayAccesses },
  };
}
