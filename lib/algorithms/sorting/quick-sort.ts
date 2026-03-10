import type { AlgorithmGenerator, AlgorithmMeta, StackFrame } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

export const quickSortMeta: AlgorithmMeta = {
  id: "quick-sort",
  name: "Quick Sort",
  category: "sorting",
  description:
    "Selects a pivot element, partitions the array so elements less than the pivot come before it and greater elements after, then recursively sorts the sub-arrays.",
  timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
  spaceComplexity: "O(log n)",
  stable: false,
  inPlace: true,
  pseudocode: `function quickSort(arr, low, high):
  if low < high:
    pivotIdx = partition(arr, low, high)
    quickSort(arr, low, pivotIdx - 1)
    quickSort(arr, pivotIdx + 1, high)

function partition(arr, low, high):
  pivot = arr[high]
  i = low - 1
  for j = low to high - 1:
    if arr[j] <= pivot:
      i++
      swap(arr[i], arr[j])
  swap(arr[i + 1], arr[high])
  return i + 1`,
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
      name: "All Duplicates (15)",
      generator: (ctx) =>
        Array.from({ length: ctx?.arraySize ?? 15 }, () => 42),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Quick sort always runs in O(n log n) time.",
      reality:
        "Quick sort degrades to O(n²) when the pivot is consistently the smallest or largest element, e.g., on already sorted arrays with naive last-element pivot.",
    },
  ],
  relatedAlgorithms: ["merge-sort", "heap-sort"],
};

registerAlgorithm(quickSortMeta);

export function* quickSort(input: number[]): AlgorithmGenerator<SortStep> {
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

  function* quickSortHelper(
    low: number,
    high: number,
    callStack: StackFrame[],
  ): AlgorithmGenerator<SortStep> {
    if (low >= high) {
      if (low === high && !sorted.includes(low)) sorted.push(low);
      return;
    }

    const frame: StackFrame = { name: "quickSort", args: { low, high } };
    const currentStack = [...callStack, frame];

    const pivotVal = arr[high];
    arrayAccesses++;

    yield {
      type: "pivot",
      data: {
        array: [...arr],
        pivot: high,
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Choosing pivot=${pivotVal} at index ${high}`,
      codeLine: 8,
      variables: { low, high, pivot: pivotVal },
      callStack: currentStack,
    };

    let i = low - 1;

    for (let j = low; j < high; j++) {
      arrayAccesses++;
      comparisons++;

      yield {
        type: "compare",
        data: {
          array: [...arr],
          comparing: [j, high],
          pivot: high,
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `Comparing arr[${j}]=${arr[j]} with pivot=${pivotVal}`,
        codeLine: 10,
        variables: { low, high, i, j, pivot: pivotVal, "arr[j]": arr[j] },
        callStack: currentStack,
      };

      if (arr[j] <= pivotVal) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          arrayAccesses += 2;

          yield {
            type: "swap",
            data: {
              array: [...arr],
              swapping: [i, j],
              pivot: high,
              sorted: [...sorted],
              comparisons,
              swaps,
              arrayAccesses,
            },
            description: `Swapping arr[${i}] and arr[${j}]`,
            codeLine: 12,
            variables: { low, high, i, j, pivot: pivotVal },
            callStack: currentStack,
          };
        }
      }
    }

    const pivotIdx = i + 1;
    if (pivotIdx !== high) {
      [arr[pivotIdx], arr[high]] = [arr[high], arr[pivotIdx]];
      swaps++;
      arrayAccesses += 2;
    }

    sorted.push(pivotIdx);

    yield {
      type: "partition-done",
      data: {
        array: [...arr],
        pivot: pivotIdx,
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Pivot ${pivotVal} placed at index ${pivotIdx}`,
      codeLine: 14,
      variables: { pivotIdx, pivot: pivotVal },
      callStack: currentStack,
    };

    yield* quickSortHelper(low, pivotIdx - 1, currentStack);
    yield* quickSortHelper(pivotIdx + 1, high, currentStack);
  }

  yield* quickSortHelper(0, n - 1, []);

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
