"use client";

import dynamic from "next/dynamic";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { NumericalControls } from "@/components/visualizers/numerical/controls";
import type { NumericalStep } from "@/lib/algorithms/numerical";
import { NUMERICAL_GENERATORS } from "@/lib/algorithms/numerical";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/numerical";

const FunctionPlot = dynamic(
  () =>
    import("@/components/visualizers/numerical/function-plot").then(
      (m) => m.FunctionPlot,
    ),
  { ssr: false },
);
const MonteCarloCanvas = dynamic(
  () =>
    import("@/components/visualizers/numerical/monte-carlo-canvas").then(
      (m) => m.MonteCarloCanvas,
    ),
  { ssr: false },
);

export default function NumericalClient() {
  const { currentStep, algorithmMeta } = useVisualizer();
  useAlgoFromUrl(
    "numerical",
    NUMERICAL_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const step = currentStep as AlgorithmStep<NumericalStep> | null;
  const numStep = step?.data ?? null;
  const algoId = algorithmMeta?.id;

  const isMonteCarlo = algoId === "monte-carlo-pi";

  return (
    <VisualizerPageLayout
      controls={<NumericalControls />}
      canvas={
        isMonteCarlo ? (
          <MonteCarloCanvas step={numStep} className="flex-1" />
        ) : (
          <FunctionPlot
            step={numStep}
            algorithmId={algoId ?? ""}
            className="flex-1"
          />
        )
      }
    />
  );
}
