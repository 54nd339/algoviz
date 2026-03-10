"use client";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { GeometryCanvas } from "@/components/visualizers/geometry/geometry-canvas";
import { GeometryControls } from "@/components/visualizers/geometry/geometry-controls";
import type { GeometryStep } from "@/lib/algorithms/geometry";
import { GEOMETRY_GENERATORS } from "@/lib/algorithms/geometry";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/geometry";

export default function GeometryClient() {
  const { currentStep } = useVisualizer();
  useAlgoFromUrl(
    "geometry",
    GEOMETRY_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const geoStep = currentStep as AlgorithmStep<GeometryStep> | null;

  return (
    <VisualizerPageLayout
      controls={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <GeometryControls />
        </div>
      }
      canvas={<GeometryCanvas step={geoStep} className="flex-1" />}
      showCallStack
    />
  );
}
