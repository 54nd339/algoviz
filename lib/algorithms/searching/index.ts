export { binarySearch, binarySearchMeta } from "./binary-search";
export { exponentialSearch, exponentialSearchMeta } from "./exponential-search";
export { jumpSearch, jumpSearchMeta } from "./jump-search";
export { linearSearch, linearSearchMeta } from "./linear-search";
export type { SearchStep } from "./types";

import type { AlgorithmStep } from "@/types";

import { binarySearch } from "./binary-search";
import { exponentialSearch } from "./exponential-search";
import { jumpSearch } from "./jump-search";
import { linearSearch } from "./linear-search";
import type { SearchStep } from "./types";

export const SEARCHING_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<SearchStep>, void, undefined>
> = {
  "linear-search": (input) =>
    linearSearch(input as { array: number[]; target: number }),
  "binary-search": (input) =>
    binarySearch(input as { array: number[]; target: number }),
  "jump-search": (input) =>
    jumpSearch(input as { array: number[]; target: number }),
  "exponential-search": (input) =>
    exponentialSearch(input as { array: number[]; target: number }),
};
