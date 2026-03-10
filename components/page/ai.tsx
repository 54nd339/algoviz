"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { AIControls } from "@/components/visualizers/ai/ai-controls";
import type { ScatterScales } from "@/components/visualizers/ai/scatter-plot";
import type {
  AIStep,
  KMeansStep,
  KNNStep,
  NeuralNetStep,
} from "@/lib/algorithms/ai";
import { AI_GENERATORS } from "@/lib/algorithms/ai";
import { useAICanvas, useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

const ScatterPlot = dynamic(
  () =>
    import("@/components/visualizers/ai/scatter-plot").then(
      (m) => m.ScatterPlot,
    ),
  { ssr: false },
);
const DecisionOverlay = dynamic(
  () =>
    import("@/components/visualizers/ai/decision-overlay").then(
      (m) => m.DecisionOverlay,
    ),
  { ssr: false },
);
const NeuralNetDiagram = dynamic(
  () =>
    import("@/components/visualizers/ai/neural-net-diagram").then(
      (m) => m.NeuralNetDiagram,
    ),
  { ssr: false },
);

export default function AIClient() {
  const { currentStep } = useVisualizer();
  useAlgoFromUrl(
    "ai",
    AI_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const step = currentStep as AlgorithmStep<AIStep> | null;
  const {
    points,
    xDomain,
    nextClass,
    setNextClass,
    algoId,
    isNeuralNet,
    handleCanvasClick,
    handleClearPoints,
    handleSyncK,
  } = useAICanvas(step);

  const renderOverlay = useCallback(
    (scales: ScatterScales) => (
      <DecisionOverlay
        algoId={algoId}
        stepData={step?.data}
        xDomain={xDomain}
        scales={scales}
      />
    ),
    [step, algoId, xDomain],
  );

  return (
    <VisualizerPageLayout
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <AIControls
            onClearPoints={handleClearPoints}
            onSyncInput={handleSyncK}
          />
          {!isNeuralNet && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-muted">
                Place class:
              </span>
              {[0, 1, 2].map((c) => (
                <button
                  key={c}
                  onClick={() => setNextClass(c)}
                  aria-label={`Select class ${c}`}
                  aria-pressed={nextClass === c}
                  className={`h-5 w-5 rounded-full border-2 transition-colors ${
                    nextClass === c ? "border-white" : "border-transparent"
                  }`}
                  style={{
                    backgroundColor:
                      c === 0
                        ? "var(--accent-cyan)"
                        : c === 1
                          ? "var(--accent-amber)"
                          : "var(--accent-green)",
                  }}
                  title={`Class ${c}`}
                />
              ))}
            </div>
          )}
        </div>
      }
      canvas={
        isNeuralNet ? (
          <NeuralNetDiagram
            step={(step?.data as NeuralNetStep) ?? null}
            className="flex-1"
          />
        ) : (
          <ScatterPlot
            points={points}
            queryPoint={
              algoId === "knn"
                ? (step?.data as KNNStep)?.queryPoint
                : undefined
            }
            highlightIndices={
              algoId === "knn"
                ? (step?.data as KNNStep)?.neighbors?.map((n) =>
                    points.findIndex((p) => p.x === n.x && p.y === n.y),
                  )
                : undefined
            }
            clusterAssignments={
              algoId === "k-means" &&
              (step?.data as KMeansStep)?.assignments?.length === points.length
                ? (step?.data as KMeansStep).assignments
                : undefined
            }
            onClickCanvas={handleCanvasClick}
            renderOverlay={renderOverlay}
            className="flex-1"
          />
        )
      }
    />
  );
}
