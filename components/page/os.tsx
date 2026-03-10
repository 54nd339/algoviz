"use client";

import { useState } from "react";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { BankersMatrix } from "@/components/visualizers/os/bankers-matrix";
import { OsControls } from "@/components/visualizers/os/controls";
import { DiskArm } from "@/components/visualizers/os/disk-arm";
import { GanttChart } from "@/components/visualizers/os/gantt-chart";
import { PageFrames } from "@/components/visualizers/os/page-frames";
import type {
  BankerStep,
  DiskStep,
  OsSubCategory,
  PageStep,
  SchedulingStep,
} from "@/lib/algorithms/os";
import { OS_GENERATORS } from "@/lib/algorithms/os";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/os";

export default function OsClient() {
  const { currentStep } = useVisualizer();
  useAlgoFromUrl(
    "os",
    OS_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const [subCategory, setSubCategory] = useState<OsSubCategory>("scheduling");

  return (
    <VisualizerPageLayout
      controls={
        <OsControls
          subCategory={subCategory}
          onSubCategoryChange={setSubCategory}
        />
      }
      canvas={
        <div className="flex-1 overflow-auto">
          {subCategory === "scheduling" && (
            <GanttChart
              step={currentStep as AlgorithmStep<SchedulingStep> | null}
              className="h-full"
            />
          )}
          {subCategory === "page-replacement" && (
            <PageFrames
              step={currentStep as AlgorithmStep<PageStep> | null}
              className="h-full"
            />
          )}
          {subCategory === "disk-scheduling" && (
            <DiskArm
              step={currentStep as AlgorithmStep<DiskStep> | null}
              className="h-full"
            />
          )}
          {subCategory === "bankers" && (
            <BankersMatrix
              step={currentStep as AlgorithmStep<BankerStep> | null}
              className="h-full"
            />
          )}
        </div>
      }
    />
  );
}
