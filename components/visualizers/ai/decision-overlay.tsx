"use client";

import { KMeansOverlay } from "@/components/visualizers/ai/kmeans-overlay";
import { KNNOverlay } from "@/components/visualizers/ai/knn-overlay";
import { PerceptronOverlay } from "@/components/visualizers/ai/perceptron-overlay";
import { RegressionOverlay } from "@/components/visualizers/ai/regression-overlay";
import type { ScatterScales } from "@/components/visualizers/ai/scatter-plot";
import type {
  KMeansStep,
  KNNStep,
  PerceptronStep,
  RegressionStep,
} from "@/lib/algorithms/ai";

export { KMeansOverlay } from "@/components/visualizers/ai/kmeans-overlay";
export { KNNOverlay } from "@/components/visualizers/ai/knn-overlay";
export { PerceptronOverlay } from "@/components/visualizers/ai/perceptron-overlay";
export { RegressionOverlay } from "@/components/visualizers/ai/regression-overlay";

interface DecisionOverlayProps {
  algoId: string | undefined;
  stepData: unknown;
  xDomain: [number, number];
  scales: ScatterScales;
}

/** Picks and renders the appropriate overlay based on algorithm and step data. */
export function DecisionOverlay({
  algoId,
  stepData,
  xDomain,
  scales,
}: DecisionOverlayProps) {
  if (!stepData || !algoId) return null;

  const { xScale, yScale, innerWidth, innerHeight } = scales;

  if (
    algoId === "linear-regression" &&
    (stepData as RegressionStep).weights
  ) {
    return (
      <RegressionOverlay
        weights={(stepData as RegressionStep).weights}
        xDomain={xDomain}
        xScale={xScale as (v: number) => number}
        yScale={yScale as (v: number) => number}
        innerWidth={innerWidth}
        innerHeight={innerHeight}
      />
    );
  }

  if (algoId === "knn" && (stepData as KNNStep).neighbors?.length > 0) {
    return (
      <KNNOverlay
        queryPoint={(stepData as KNNStep).queryPoint}
        neighbors={(stepData as KNNStep).neighbors}
        distances={(stepData as KNNStep).distances}
        k={(stepData as KNNStep).k}
        xScale={xScale as (v: number) => number}
        yScale={yScale as (v: number) => number}
        innerWidth={innerWidth}
        innerHeight={innerHeight}
      />
    );
  }

  if (algoId === "k-means" && (stepData as KMeansStep).centroids) {
    return (
      <KMeansOverlay
        centroids={(stepData as KMeansStep).centroids}
        points={(stepData as KMeansStep).points}
        assignments={(stepData as KMeansStep).assignments}
        xScale={xScale as (v: number) => number}
        yScale={yScale as (v: number) => number}
        innerWidth={innerWidth}
        innerHeight={innerHeight}
      />
    );
  }

  if (
    algoId === "perceptron" &&
    (stepData as PerceptronStep).decisionBoundary
  ) {
    return (
      <PerceptronOverlay
        boundary={(stepData as PerceptronStep).decisionBoundary}
        xDomain={xDomain}
        xScale={xScale as (v: number) => number}
        yScale={yScale as (v: number) => number}
        innerWidth={innerWidth}
        innerHeight={innerHeight}
      />
    );
  }

  return null;
}
