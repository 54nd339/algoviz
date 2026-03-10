import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

export const countingSortMeta: AlgorithmMeta = {
  id: "counting-sort",
  name: "Counting Sort",
  category: "sorting",
  description:
    "Counts the number of objects with each distinct key value, then uses arithmetic to determine the positions of each key value in the output sequence. Not a comparison-based sort.",
  timeComplexity: { best: "O(n + k)", average: "O(n + k)", worst: "O(n + k)" },
  spaceComplexity: "O(n + k)",
  stable: true,
  inPlace: false,
  pseudocode: `function countingSort(arr):
  max = getMax(arr)
  count[0..max] = 0
  for each element in arr:
    count[element]++
  for i = 1 to max:
    count[i] += count[i - 1]
  for i = n - 1 down to 0:
    output[count[arr[i]] - 1] = arr[i]
    count[arr[i]]--
  copy output to arr`,
  presets: [
    {
      name: "Random (20, range 0-20)",
      generator: (ctx) =>
        Array.from({ length: ctx?.arraySize ?? 20 }, () =>
          Math.floor(Math.random() * 21),
        ),
      expectedCase: "average",
    },
    {
      name: "Small Range (25, range 0-5)",
      generator: (ctx) =>
        Array.from({ length: ctx?.arraySize ?? 25 }, () =>
          Math.floor(Math.random() * 6),
        ),
      expectedCase: "best",
    },
  ],
  misconceptions: [
    {
      myth: "Counting sort can sort any type of data.",
      reality:
        "Counting sort only works on non-negative integers (or data that can be mapped to non-negative integers). The range of values (k) directly affects memory usage.",
    },
  ],
  relatedAlgorithms: ["radix-sort"],
};

registerAlgorithm(countingSortMeta);

export function* countingSort(input: number[]): AlgorithmGenerator<SortStep> {
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
  const count = new Array(max + 1).fill(0);

  // Counting phase
  for (let i = 0; i < n; i++) {
    count[arr[i]]++;
    arrayAccesses += 2;

    yield {
      type: "count",
      data: {
        array: [...arr],
        comparing: [i, -1],
        sorted: [],
        buckets: [count.filter((c) => c > 0)],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Counting arr[${i}]=${arr[i]}: count[${arr[i]}] = ${count[arr[i]]}`,
      codeLine: 4,
      variables: { i, "arr[i]": arr[i], count: [...count] },
    };
  }

  // Prefix sum phase
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
    arrayAccesses += 2;
  }

  yield {
    type: "prefix-sum",
    data: { array: [...arr], sorted: [], comparisons, swaps, arrayAccesses },
    description: "Computed prefix sums for stable placement",
    codeLine: 6,
    variables: { "count (prefix)": [...count] },
  };

  // Build output
  const output = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i];
    const pos = count[val] - 1;
    output[pos] = val;
    count[val]--;
    arrayAccesses += 3;
    swaps++;

    yield {
      type: "place",
      data: {
        array: output.map((v) => v ?? 0),
        sorted: output.reduce<number[]>(
          (acc, v, idx) => (v !== undefined ? [...acc, idx] : acc),
          [],
        ),
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Placing ${val} at output[${pos}]`,
      codeLine: 9,
      variables: { i, val, pos, "count[val]": count[val] },
    };
  }

  for (let i = 0; i < n; i++) arr[i] = output[i];

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
    description: `Sorting complete! No comparisons needed (non-comparison sort)`,
    variables: { comparisons, swaps, arrayAccesses },
  };
}
