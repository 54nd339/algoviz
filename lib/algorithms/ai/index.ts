export { kMeans, kMeansMeta } from "./k-means";
export { knn, knnMeta } from "./knn";
export { linearRegression, linearRegressionMeta } from "./linear-regression";
export { neuralNet, neuralNetMeta } from "./neural-net";
export { perceptron, perceptronMeta } from "./perceptron";
export type {
  AIStep,
  DataPoint,
  KMeansStep,
  KNNStep,
  NeuralNetStep,
  NeuronLayer,
  PerceptronStep,
  RegressionStep,
} from "./types";

import type { AlgorithmStep } from "@/types";

import { kMeans } from "./k-means";
import { knn } from "./knn";
import { linearRegression } from "./linear-regression";
import { neuralNet } from "./neural-net";
import { perceptron } from "./perceptron";
import type { AIStep } from "./types";

export const AI_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<AIStep>, void, undefined>
> = {
  "linear-regression": (input) =>
    linearRegression(input as Parameters<typeof linearRegression>[0]),
  knn: (input) => knn(input as Parameters<typeof knn>[0]),
  "k-means": (input) => kMeans(input as Parameters<typeof kMeans>[0]),
  perceptron: (input) => perceptron(input as Parameters<typeof perceptron>[0]),
  "neural-net": (input) => neuralNet(input as Parameters<typeof neuralNet>[0]),
};
