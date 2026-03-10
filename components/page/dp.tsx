"use client";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { DPControls } from "@/components/visualizers/dp/controls";
import { DPTable } from "@/components/visualizers/dp/dp-table";
import { DPTable1D } from "@/components/visualizers/dp/dp-table-1d";
import { FibTree } from "@/components/visualizers/dp/fib-tree";
import type { DPStep, FibStep } from "@/lib/algorithms/dp";
import { DP_GENERATORS } from "@/lib/algorithms/dp";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/dp";

const TWO_D_ALGOS = new Set([
  "knapsack-dp",
  "lcs-dp",
  "edit-distance-dp",
  "matrix-chain-dp",
]);
const ONE_D_ALGOS = new Set(["coin-change-dp"]);

export default function DPClient() {
  const { currentStep, algorithmMeta } = useVisualizer();
  useAlgoFromUrl(
    "dp",
    DP_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );

  const algoId = algorithmMeta?.id ?? "";
  const is2D = TWO_D_ALGOS.has(algoId);
  const is1D = ONE_D_ALGOS.has(algoId);
  const isFib = algoId === "fibonacci-dp";

  const fibStep = currentStep as AlgorithmStep<FibStep> | null;
  const dpStep = currentStep as AlgorithmStep<DPStep> | null;
  const isNaiveMode = isFib && fibStep?.data?.mode === "naive";

  return (
    <VisualizerPageLayout
      controls={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <DPControls />
        </div>
      }
      canvas={
        <>
          {is2D && <DPTable step={dpStep} className="flex-1" />}

          {is1D && <DPTable1D step={fibStep} className="flex-1" />}

          {isFib && !isNaiveMode && (
            <DPTable1D step={fibStep} className="flex-1" />
          )}

          {isFib && isNaiveMode && (
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <FibTree step={fibStep} className="flex-1" />
            </div>
          )}

          {!is2D && !is1D && !isFib && !currentStep && (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border">
              <p className="font-mono text-xs text-text-muted">
                Select a DP problem and press play
              </p>
            </div>
          )}
        </>
      }
      showCallStack
    />
  );
}
