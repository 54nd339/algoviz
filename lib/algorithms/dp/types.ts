export interface DPStep {
  table: (number | null)[][];
  currentCell: [number, number];
  dependencies: [number, number][];
  filledCells: [number, number][];
  result?: number | string;
  backtrackPath?: [number, number][];
  subproblemLabel?: string;
  rowHeaders?: string[];
  colHeaders?: string[];
  operation?: "insert" | "delete" | "replace" | "match" | "include" | "exclude";
}

export interface FibTreeNode {
  value: number;
  children: FibTreeNode[];
  duplicate: boolean;
  computed: boolean;
}

export interface FibStep {
  table: (number | null)[];
  currentIndex: number;
  computedIndices: number[];
  dependencies?: number[];
  subproblemLabel?: string;
  coinUsed?: number;
  recursionTree?: FibTreeNode;
  duplicateWork?: number[];
  mode?: "naive" | "dp";
}
