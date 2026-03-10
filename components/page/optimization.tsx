"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import {
  OptimizationControls,
  type OptimizationControlsHandle,
} from "@/components/visualizers/optimization/optimization-controls";
import type { OptimizationStep } from "@/lib/algorithms/optimization";
import { OPTIMIZATION_GENERATORS } from "@/lib/algorithms/optimization";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/optimization";

const ContourPlot = dynamic(
  () =>
    import("@/components/visualizers/optimization/contour-plot").then(
      (m) => m.ContourPlot,
    ),
  { ssr: false },
);
const PopulationPlot = dynamic(
  () =>
    import("@/components/visualizers/optimization/population-plot").then(
      (m) => m.PopulationPlot,
    ),
  { ssr: false },
);

export default function OptimizationClient() {
  const controlsRef = useRef<OptimizationControlsHandle>(null);
  const { currentStep, algorithmMeta } = useVisualizer();
  useAlgoFromUrl(
    "optimization",
    OPTIMIZATION_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const step = currentStep as AlgorithmStep<OptimizationStep> | null;
  const optStep = step?.data ?? null;
  const algoId = algorithmMeta?.id;

  const is2D = algoId === "gradient-descent";
  const isGA = algoId === "genetic-algorithm";
  const showStartDrag =
    is2D || algoId === "hill-climbing" || algoId === "simulated-annealing";

  const handleStartChange = useCallback((x: number, y?: number) => {
    controlsRef.current?.applyStart(x, y ?? 0);
  }, []);

  return (
    <VisualizerPageLayout
      controls={<OptimizationControls ref={controlsRef} />}
      canvas={
        <>
          <ContourPlot
            step={optStep}
            is2D={is2D}
            onStartChange={showStartDrag ? handleStartChange : undefined}
            className="flex-1"
          />
          {isGA && <PopulationPlot step={optStep} />}
        </>
      }
    />
  );
}
