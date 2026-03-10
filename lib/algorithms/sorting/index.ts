export { bubbleSort, bubbleSortMeta } from "./bubble-sort";
export { countingSort, countingSortMeta } from "./counting-sort";
export { heapSort, heapSortMeta } from "./heap-sort";
export { insertionSort, insertionSortMeta } from "./insertion-sort";
export { mergeSort, mergeSortMeta } from "./merge-sort";
export { quickSort, quickSortMeta } from "./quick-sort";
export { radixSort, radixSortMeta } from "./radix-sort";
export { selectionSort, selectionSortMeta } from "./selection-sort";
export { shellSort, shellSortMeta } from "./shell-sort";
export { timSort, timSortMeta } from "./tim-sort";
export type { SortStep } from "./types";

import type { AlgorithmStep } from "@/types";

import { bubbleSort } from "./bubble-sort";
import { countingSort } from "./counting-sort";
import { heapSort } from "./heap-sort";
import { insertionSort } from "./insertion-sort";
import { mergeSort } from "./merge-sort";
import { quickSort } from "./quick-sort";
import { radixSort } from "./radix-sort";
import { selectionSort } from "./selection-sort";
import { shellSort } from "./shell-sort";
import { timSort } from "./tim-sort";
import type { SortStep } from "./types";

export const SORTING_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<SortStep>, void, undefined>
> = {
  "bubble-sort": (input) => bubbleSort(input as number[]),
  "selection-sort": (input) => selectionSort(input as number[]),
  "insertion-sort": (input) => insertionSort(input as number[]),
  "merge-sort": (input) => mergeSort(input as number[]),
  "quick-sort": (input) => quickSort(input as number[]),
  "heap-sort": (input) => heapSort(input as number[]),
  "radix-sort": (input) => radixSort(input as number[]),
  "counting-sort": (input) => countingSort(input as number[]),
  "shell-sort": (input) => shellSort(input as number[]),
  "tim-sort": (input) => timSort(input as number[]),
};
