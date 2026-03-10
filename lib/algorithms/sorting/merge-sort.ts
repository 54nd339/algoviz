import type { AlgorithmGenerator, AlgorithmMeta, StackFrame } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

export const mergeSortMeta: AlgorithmMeta = {
  id: "merge-sort",
  name: "Merge Sort",
  category: "sorting",
  description:
    "Divides the array in half, recursively sorts each half, then merges the two sorted halves. A classic divide-and-conquer algorithm with guaranteed O(n log n) performance.",
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
  },
  spaceComplexity: "O(n)",
  stable: true,
  inPlace: false,
  pseudocode: `function mergeSort(arr, left, right):
  if left >= right: return
  mid = (left + right) / 2
  mergeSort(arr, left, mid)
  mergeSort(arr, mid + 1, right)
  merge(arr, left, mid, right)

function merge(arr, left, mid, right):
  create temp arrays L, R
  copy arr[left..mid] to L
  copy arr[mid+1..right] to R
  merge L and R back into arr[left..right]`,
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
      name: "Already Sorted (16)",
      generator: (ctx) =>
        Array.from({ length: ctx?.arraySize ?? 16 }, (_, i) => i + 1),
      expectedCase: "best",
    },
    {
      name: "Reverse Sorted (16)",
      generator: (ctx) => {
        const n = ctx?.arraySize ?? 16;
        return Array.from({ length: n }, (_, i) => n - i);
      },
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Merge sort is always faster than quick sort.",
      reality:
        "While merge sort has better worst-case complexity, quick sort is typically faster in practice due to better cache locality and lower constant factors.",
    },
  ],
  relatedAlgorithms: ["quick-sort", "tim-sort"],
};

registerAlgorithm(mergeSortMeta);

export function* mergeSort(input: number[]): AlgorithmGenerator<SortStep> {
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

  function* mergeSortHelper(
    left: number,
    right: number,
    callStack: StackFrame[],
  ): AlgorithmGenerator<SortStep> {
    if (left >= right) {
      if (left === right) sorted.push(left);
      return;
    }

    const mid = Math.floor((left + right) / 2);
    const frame: StackFrame = { name: "mergeSort", args: { left, right, mid } };
    const currentStack = [...callStack, frame];

    yield {
      type: "divide",
      data: {
        array: [...arr],
        comparing: [left, right],
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Dividing [${left}..${right}] at mid=${mid}`,
      codeLine: 3,
      variables: { left, right, mid },
      callStack: currentStack,
    };

    yield* mergeSortHelper(left, mid, currentStack);
    yield* mergeSortHelper(mid + 1, right, currentStack);

    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    arrayAccesses += right - left + 1;

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      arrayAccesses += 2;

      yield {
        type: "merge-compare",
        data: {
          array: [...arr],
          comparing: [left + i, mid + 1 + j],
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `Merging: comparing ${leftArr[i]} and ${rightArr[j]}`,
        codeLine: 12,
        variables: {
          left,
          right,
          mid,
          i,
          j,
          k,
          "L[i]": leftArr[i],
          "R[j]": rightArr[j],
        },
        callStack: currentStack,
      };

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      swaps++;
      arrayAccesses++;
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      arrayAccesses++;
      swaps++;
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      arrayAccesses++;
      swaps++;
      j++;
      k++;
    }

    for (let idx = left; idx <= right; idx++) {
      if (!sorted.includes(idx)) sorted.push(idx);
    }

    yield {
      type: "merge-done",
      data: {
        array: [...arr],
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Merged [${left}..${mid}] and [${mid + 1}..${right}]`,
      codeLine: 12,
      variables: { left, right, mid },
      callStack: callStack,
    };
  }

  yield* mergeSortHelper(0, n - 1, []);

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
    description: `Sorting complete! ${comparisons} comparisons, ${swaps} writes`,
    variables: { comparisons, swaps, arrayAccesses },
  };
}
