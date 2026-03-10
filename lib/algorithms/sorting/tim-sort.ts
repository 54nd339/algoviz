import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

const MIN_RUN = 4;

export const timSortMeta: AlgorithmMeta = {
  id: "tim-sort",
  name: "Tim Sort",
  category: "sorting",
  description:
    "A hybrid sorting algorithm derived from merge sort and insertion sort. Identifies natural runs in the data, extends them with insertion sort, then merges them. Used as the default sort in Python and Java.",
  timeComplexity: { best: "O(n)", average: "O(n log n)", worst: "O(n log n)" },
  spaceComplexity: "O(n)",
  stable: true,
  inPlace: false,
  pseudocode: `function timSort(arr):
  n = arr.length
  minRun = computeMinRun(n)
  // Sort individual runs with insertion sort
  for start = 0; start < n; start += minRun:
    end = min(start + minRun - 1, n - 1)
    insertionSort(arr, start, end)
  // Merge runs
  size = minRun
  while size < n:
    for left = 0; left < n; left += 2*size:
      mid = min(left + size - 1, n - 1)
      right = min(left + 2*size - 1, n - 1)
      if mid < right:
        merge(arr, left, mid, right)
    size *= 2`,
  presets: [
    {
      name: "Random (24)",
      generator: (ctx) =>
        Array.from(
          { length: ctx?.arraySize ?? 24 },
          () => Math.floor(Math.random() * 100) + 1,
        ),
      expectedCase: "average",
    },
    {
      name: "Nearly Sorted (24)",
      generator: (ctx) => {
        const n = ctx?.arraySize ?? 24;
        const arr = Array.from({ length: n }, (_, i) => i + 1);
        arr[Math.min(5, n - 1)] = Math.min(20, n);
        arr[Math.min(19, n - 1)] = 6;
        arr[Math.min(10, n - 1)] = Math.min(22, n);
        arr[Math.min(21, n - 1)] = 11;
        return arr;
      },
      expectedCase: "best",
    },
  ],
  misconceptions: [
    {
      myth: "Tim Sort is just merge sort.",
      reality:
        "Tim Sort is specifically designed to exploit existing order in the data. It identifies natural runs and uses insertion sort for small segments, making it much faster on real-world data than pure merge sort.",
    },
  ],
  relatedAlgorithms: ["merge-sort", "insertion-sort"],
};

registerAlgorithm(timSortMeta);

export function* timSort(input: number[]): AlgorithmGenerator<SortStep> {
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
    description: `Tim Sort: minRun=${MIN_RUN}, will sort runs then merge`,
    codeLine: 1,
    variables: { n, minRun: MIN_RUN },
  };

  // Insertion sort for individual runs
  for (let start = 0; start < n; start += MIN_RUN) {
    const end = Math.min(start + MIN_RUN - 1, n - 1);

    yield {
      type: "run-start",
      data: {
        array: [...arr],
        comparing: [start, end],
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Insertion sorting run [${start}..${end}]`,
      codeLine: 5,
      variables: { start, end },
    };

    for (let i = start + 1; i <= end; i++) {
      const key = arr[i];
      arrayAccesses++;
      let j = i - 1;

      while (j >= start && arr[j] > key) {
        comparisons++;
        arrayAccesses += 2;
        arr[j + 1] = arr[j];
        swaps++;
        j--;
      }
      if (j >= start) {
        comparisons++;
        arrayAccesses++;
      }

      arr[j + 1] = key;
      arrayAccesses++;
    }

    for (let i = start; i <= end; i++) {
      if (!sorted.includes(i)) sorted.push(i);
    }

    yield {
      type: "run-sorted",
      data: {
        array: [...arr],
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Run [${start}..${end}] sorted via insertion sort`,
      codeLine: 6,
      variables: { start, end },
    };
  }

  // Merge runs
  for (let size = MIN_RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + 2 * size - 1, n - 1);

      if (mid >= right) continue;

      yield {
        type: "merge-start",
        data: {
          array: [...arr],
          comparing: [left, right],
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `Merging [${left}..${mid}] and [${mid + 1}..${right}]`,
        codeLine: 12,
        variables: { size, left, mid, right },
      };

      // Merge subroutine
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      arrayAccesses += right - left + 1;

      let i = 0;
      let j = 0;
      let k = left;

      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;
        arrayAccesses += 2;

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
        swaps++;
        arrayAccesses++;
        i++;
        k++;
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        swaps++;
        arrayAccesses++;
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
        description: `Merged [${left}..${right}]`,
        codeLine: 14,
        variables: { size, left, mid, right },
      };
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
    description: `Sorting complete! ${comparisons} comparisons, ${swaps} writes`,
    variables: { comparisons, swaps, arrayAccesses },
  };
}
