export type AlgorithmCategory =
  | "sorting"
  | "searching"
  | "data-structures"
  | "string"
  | "pathfinding"
  | "graph"
  | "dp"
  | "geometry"
  | "ai"
  | "optimization"
  | "numerical"
  | "games"
  | "fractals"
  | "os"
  | "crypto";

export interface StackFrame {
  name: string;
  args: Record<string, unknown>;
  locals?: Record<string, unknown>;
}

export interface Highlight {
  indices: number[];
  color: string;
  label?: string;
}

export interface AlgorithmStep<T = unknown> {
  type: string;
  data: T;
  description: string;
  highlights?: Highlight[];
  codeLine?: number;
  variables?: Record<string, unknown>;
  callStack?: StackFrame[];
  reasoning?: string;
  invariant?: string;
}

export type AlgorithmGenerator<T = unknown> = Generator<
  AlgorithmStep<T>,
  void,
  undefined
>;

export interface PresetContext {
  arraySize?: number;
}

export interface Preset {
  name: string;
  generator: (context?: PresetContext) => unknown;
  expectedCase: "best" | "average" | "worst" | "random";
}

export interface Misconception {
  myth: string;
  reality: string;
}

export interface AlgorithmMeta {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stable?: boolean;
  inPlace?: boolean;
  pseudocode?: string;
  presets?: Preset[];
  misconceptions?: Misconception[];
  relatedAlgorithms?: string[];
}
