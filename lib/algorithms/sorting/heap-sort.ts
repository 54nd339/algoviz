import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { SortStep } from "./types";

export const heapSortMeta: AlgorithmMeta = {
  id: "heap-sort",
  name: "Heap Sort",
  category: "sorting",
  description:
    "Builds a max heap from the array, then repeatedly extracts the maximum element and places it at the end. Guarantees O(n log n) in all cases.",
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
  },
  spaceComplexity: "O(1)",
  stable: false,
  inPlace: true,
  pseudocode: `function heapSort(arr):
  n = arr.length
  // Build max heap
  for i = n/2 - 1 down to 0:
    heapify(arr, n, i)
  // Extract elements
  for i = n - 1 down to 1:
    swap(arr[0], arr[i])
    heapify(arr, i, 0)

function heapify(arr, n, i):
  largest = i
  left = 2*i + 1
  right = 2*i + 2
  if left < n and arr[left] > arr[largest]:
    largest = left
  if right < n and arr[right] > arr[largest]:
    largest = right
  if largest != i:
    swap(arr[i], arr[largest])
    heapify(arr, n, largest)`,
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
      name: "Already Sorted (20)",
      generator: (ctx) =>
        Array.from({ length: ctx?.arraySize ?? 20 }, (_, i) => i + 1),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Heap sort is always better than quick sort because it's O(n log n) worst case.",
      reality:
        "Heap sort has poor cache locality compared to quick sort, making it slower in practice despite its better worst-case guarantee.",
    },
  ],
  relatedAlgorithms: ["quick-sort", "merge-sort"],
};

registerAlgorithm(heapSortMeta);

export function* heapSort(input: number[]): AlgorithmGenerator<SortStep> {
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
    description: "Initial array — building max heap",
    codeLine: 1,
    variables: { n },
  };

  function* heapify(
    size: number,
    i: number,
    phase: string,
  ): AlgorithmGenerator<SortStep> {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size) {
      arrayAccesses += 2;
      comparisons++;
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < size) {
      arrayAccesses += 2;
      comparisons++;
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      yield {
        type: "compare",
        data: {
          array: [...arr],
          comparing: [i, largest],
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `${phase}: node ${i} (${arr[i]}) < child ${largest} (${arr[largest]})`,
        codeLine: largest === left ? 14 : 16,
        variables: {
          i,
          largest,
          left,
          right,
          "arr[i]": arr[i],
          "arr[largest]": arr[largest],
        },
      };

      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      swaps++;
      arrayAccesses += 2;

      yield {
        type: "swap",
        data: {
          array: [...arr],
          swapping: [i, largest],
          sorted: [...sorted],
          comparisons,
          swaps,
          arrayAccesses,
        },
        description: `${phase}: swapping ${arr[largest]} and ${arr[i]}`,
        codeLine: 19,
        variables: { i, largest },
      };

      yield* heapify(size, largest, phase);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i, "Build heap");
  }

  yield {
    type: "heap-built",
    data: {
      array: [...arr],
      sorted: [...sorted],
      comparisons,
      swaps,
      arrayAccesses,
    },
    description: "Max heap built — now extracting elements",
    codeLine: 4,
    variables: { max: arr[0] },
  };

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;
    arrayAccesses += 2;
    sorted.push(i);

    yield {
      type: "extract",
      data: {
        array: [...arr],
        swapping: [0, i],
        sorted: [...sorted],
        comparisons,
        swaps,
        arrayAccesses,
      },
      description: `Extracting max=${arr[i]}, placing at index ${i}`,
      codeLine: 7,
      variables: { i, extracted: arr[i] },
    };

    yield* heapify(i, 0, "Heapify");
  }

  sorted.push(0);
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
