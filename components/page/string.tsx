"use client";

import { useState } from "react";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { StringControls } from "@/components/visualizers/string/controls";
import { RegexNFAVisualizer } from "@/components/visualizers/string/regex-nfa";
import { StringCanvas } from "@/components/visualizers/string/string-canvas";
import { TablePanel } from "@/components/visualizers/string/table-panel";
import {
  type RegexNFAStep,
  STRING_GENERATORS,
  type StringMatchStep,
} from "@/lib/algorithms/string";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/string";

export default function StringClient() {
  const { currentStep, algorithmMeta } = useVisualizer();
  useAlgoFromUrl(
    "string",
    STRING_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const [isRegexMode, setIsRegexMode] = useState(false);

  const isRegex = isRegexMode || algorithmMeta?.id === "regex-nfa";
  const stringStep = currentStep as AlgorithmStep<StringMatchStep> | null;
  const nfaStep = currentStep as AlgorithmStep<RegexNFAStep> | null;

  return (
    <VisualizerPageLayout
      controls={
        <StringControls isRegexMode={isRegex} onToggleRegex={setIsRegexMode} />
      }
      canvas={
        <div
          className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          {isRegex ? (
            <RegexNFAVisualizer step={nfaStep} />
          ) : (
            <StringCanvas step={stringStep} />
          )}
        </div>
      }
      afterCanvas={!isRegex ? <TablePanel step={stringStep} /> : null}
    />
  );
}
