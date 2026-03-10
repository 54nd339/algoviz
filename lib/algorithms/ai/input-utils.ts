import type { AIStep, DataPoint, KNNStep } from "@/lib/algorithms/ai";
import type { AlgorithmStep } from "@/types";

export function buildInputWithPoints(
  algoId: string,
  pts: DataPoint[],
  step: AlgorithmStep<AIStep> | null,
  k: number,
): unknown {
  if (algoId === "linear-regression") {
    return { points: pts, learningRate: 0.0001, epochs: 50 };
  }
  if (algoId === "knn") {
    const qp =
      step?.data && "queryPoint" in step.data
        ? (step.data as KNNStep).queryPoint
        : pts.length > 0
          ? pts[pts.length - 1]
          : { x: 50, y: 50 };
    return { points: pts, queryPoint: qp, k };
  }
  if (algoId === "k-means") {
    return { points: pts, k, maxIterations: 20 };
  }
  if (algoId === "perceptron") {
    return { points: pts, learningRate: 0.1, maxEpochs: 100 };
  }
  return { points: pts };
}
