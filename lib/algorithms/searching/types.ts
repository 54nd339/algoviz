export interface SearchStep {
  array: number[];
  target: number;
  left: number;
  right: number;
  mid?: number;
  current?: number;
  found?: number;
  eliminated: number[];
  comparisons: number;
}
