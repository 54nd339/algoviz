export interface SortStep {
  array: number[];
  comparing?: [number, number];
  swapping?: [number, number];
  sorted: number[];
  pivot?: number;
  buckets?: number[][];
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
}
