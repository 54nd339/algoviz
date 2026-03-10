export interface DataPoint {
  x: number;
  y: number;
  class?: number;
}

export interface NeuronLayer {
  size: number;
  activation: "sigmoid" | "relu" | "linear";
}

export interface RegressionStep {
  points: DataPoint[];
  weights: { m: number; b: number };
  loss: number;
  epoch: number;
  learningRate: number;
  gradients: { dm: number; db: number };
  lossHistory: number[];
}

export interface KNNStep {
  points: DataPoint[];
  queryPoint: DataPoint;
  k: number;
  distances: { point: DataPoint; distance: number }[];
  neighbors: DataPoint[];
  prediction: number;
  phase: "init" | "compute-distances" | "select-neighbors" | "predict" | "done";
}

export interface KMeansStep {
  points: DataPoint[];
  centroids: DataPoint[];
  assignments: number[];
  iteration: number;
  converged: boolean;
  previousCentroids?: DataPoint[];
  phase: "init" | "assign" | "update" | "converged" | "done";
}

export interface PerceptronStep {
  points: DataPoint[];
  weights: number[];
  decisionBoundary: { m: number; b: number } | null;
  currentPoint?: DataPoint;
  prediction?: number;
  correct?: boolean;
  epoch: number;
  totalErrors: number;
  phase: "init" | "predict" | "update" | "epoch-end" | "done" | "failed";
}

export interface NeuralNetStep {
  layers: NeuronLayer[];
  activations: number[][];
  weights: number[][][];
  biases: number[][];
  errors?: number[][];
  loss: number;
  epoch: number;
  phase: "init" | "forward" | "backward" | "update" | "epoch-end" | "done";
  lossHistory: number[];
  currentInput?: DataPoint;
  currentTarget?: number;
}

export type AIStep =
  | RegressionStep
  | KNNStep
  | KMeansStep
  | PerceptronStep
  | NeuralNetStep;
