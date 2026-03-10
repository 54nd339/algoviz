"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PanelRightOpen, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import {
  AlgorithmInfoDrawer,
  CallStackPanel,
  CodePanel,
  PlayerControls,
  PostRunSummary,
  VariableWatchPanel,
} from "@/components/visualizers/shared";
import { MetricsOverlay } from "@/components/visualizers/sorting/metrics-overlay";
import { SortingCanvas } from "@/components/visualizers/sorting/sorting-canvas";
import { SortingControls } from "@/components/visualizers/sorting/sorting-controls";
import { SORTING_GENERATORS, type SortStep } from "@/lib/algorithms/sorting";
import { generateRandomArray } from "@/lib/algorithms/sorting/utils";
import { useAlgoFromUrl, useSortingSound, useSound, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

const SortingOverview = dynamic(
  () =>
    import("@/components/visualizers/sorting/sorting-overview").then(
      (m) => m.SortingOverview,
    ),
  { ssr: false },
);

const PixelSort = dynamic(
  () =>
    import("@/components/visualizers/sorting/pixel-sort").then(
      (m) => m.PixelSort,
    ),
  { ssr: false },
);

function SortingSidePanelContent() {
  return (
    <>
      <PostRunSummary />
      <CodePanel />
      <VariableWatchPanel />
      <CallStackPanel />
      <AlgorithmInfoDrawer />
    </>
  );
}

function SortingMobileInfoPanel() {
  return (
    <div className="rounded-lg border border-border bg-bg-surface/80 backdrop-blur-sm lg:hidden">
      <Tabs defaultValue="code" className="w-full">
        <TabsList className="w-full justify-start rounded-b-none border-b border-border bg-transparent px-2">
          <TabsTrigger value="code" className="text-xs">
            Pseudocode
          </TabsTrigger>
          <TabsTrigger value="watch" className="text-xs">
            Watch
          </TabsTrigger>
          <TabsTrigger value="info" className="text-xs">
            Info
          </TabsTrigger>
        </TabsList>
        <TabsContent value="code" className="mt-0 max-h-56 overflow-y-auto p-0">
          <CodePanel className="border-0" />
        </TabsContent>
        <TabsContent value="watch" className="mt-0 max-h-56 overflow-y-auto p-0">
          <PostRunSummary className="p-3" />
          <VariableWatchPanel className="border-0" />
          <CallStackPanel className="border-0" />
        </TabsContent>
        <TabsContent value="info" className="mt-0 max-h-56 overflow-y-auto p-0">
          <AlgorithmInfoDrawer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SortingClient() {
  const { currentStep } = useVisualizer();
  const { playTone } = useSound();
  const [activeTab, setActiveTab] = useState("visualizer");
  const [arraySize, setArraySize] = useState(30);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sortStep = currentStep as AlgorithmStep<SortStep> | null;

  useAlgoFromUrl(
    "sorting",
    SORTING_GENERATORS as Record<string, (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>>,
    (meta) => meta.presets?.[0]?.generator({ arraySize: 30 }) ?? generateRandomArray(30),
  );
  useSortingSound(sortStep, playTone);

  return (
    <div className="flex h-[calc(100dvh-4.75rem)] flex-col gap-3 overflow-y-auto p-4 lg:overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="art">Art Mode</TabsTrigger>
          </TabsList>

          {(activeTab === "visualizer" || activeTab === "art") && (
            <SortingControls
              algorithmOnly={activeTab === "art"}
              arraySize={arraySize}
              onArraySizeChange={setArraySize}
            />
          )}
        </div>

        <TabsContent
          value="visualizer"
          className="mt-3 flex min-h-0 flex-1 flex-col"
        >
          <div className="flex min-h-0 flex-1 gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <PlayerControls />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open side panel"
                >
                  <PanelRightOpen size={18} />
                </Button>
              </div>
              <MetricsOverlay step={sortStep} />
              <SortingCanvas step={sortStep} className="flex-1" />
              <SortingMobileInfoPanel />
            </div>

            <div className="hidden w-72 shrink-0 flex-col gap-2 overflow-y-auto lg:flex">
              <SortingSidePanelContent />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-3 flex-1 overflow-auto">
          <SortingOverview />
        </TabsContent>

        <TabsContent value="art" className="mt-3 flex-1 overflow-auto">
          <PixelSort />
        </TabsContent>
      </Tabs>

      <DialogPrimitive.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" />
          <DialogPrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto border-l border-border bg-bg-surface p-4 shadow-lg lg:hidden">
            <DialogPrimitive.Title className="sr-only">
              Side Panel
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="absolute top-3 right-3 rounded-sm text-text-muted opacity-70 transition-opacity hover:opacity-100 focus:ring-1 focus:ring-accent-green focus:outline-none">
              <X size={16} />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
            <div className="flex flex-col gap-2 pt-6">
              <SortingSidePanelContent />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
