"use client";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { SearchCanvas } from "@/components/visualizers/searching/search-canvas";
import { SearchControls } from "@/components/visualizers/searching/search-controls";
import type { SearchStep } from "@/lib/algorithms/searching";
import { SEARCHING_GENERATORS } from "@/lib/algorithms/searching";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/searching";

export default function SearchingClient() {
  const { currentStep } = useVisualizer();
  useAlgoFromUrl(
    "searching",
    SEARCHING_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );

  const searchStep = currentStep as AlgorithmStep<SearchStep> | null;

  return (
    <VisualizerPageLayout
      controls={<SearchControls />}
      canvas={
        <div
          className="flex flex-1 items-center justify-center overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <SearchCanvas step={searchStep} />
        </div>
      }
    />
  );
}
