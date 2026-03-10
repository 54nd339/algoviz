"use client";

import { useMemo, useState } from "react";
import { PanelRightOpen, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { DSControls } from "@/components/visualizers/data-structures/ds-controls";
import { DSRepl } from "@/components/visualizers/data-structures/ds-repl";
import { HashRenderer } from "@/components/visualizers/data-structures/hash-renderer";
import { LinearRenderer } from "@/components/visualizers/data-structures/linear-renderer";
import { MemoryLayout } from "@/components/visualizers/data-structures/memory-layout";
import { TreeRenderer } from "@/components/visualizers/data-structures/tree-renderer";
import { UnionFindRenderer } from "@/components/visualizers/data-structures/union-find-renderer";
import {
  AlgorithmInfoDrawer,
  CallStackPanel,
  CodePanel,
  PlayerControls,
  PostRunSummary,
  VariableWatchPanel,
} from "@/components/visualizers/shared";
import {
  type BTreeState,
  DS_GENERATORS,
  DS_RENDERER_MAP,
  type DSStep,
  type HashTableState,
  type HeapState,
  type HuffmanState,
  type LinkedListState,
  type QueueState,
  type StackState,
  type TrieState,
  type UnionFindState,
} from "@/lib/algorithms/data-structures";
import {
  getTreeRoot,
  getTreeVariant,
  heapArrayToTree,
} from "@/lib/algorithms/data-structures/ds-helpers";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

function DSSidePanelContent({ showCallStack }: { showCallStack: boolean }) {
  return (
    <>
      <CodePanel />
      <VariableWatchPanel />
      {showCallStack && <CallStackPanel />}
      <AlgorithmInfoDrawer />
    </>
  );
}

export default function DataStructuresClient() {
  const { currentStep, algorithmMeta } = useVisualizer();
  useAlgoFromUrl(
    "data-structures",
    DS_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const [showMemoryLayout, setShowMemoryLayout] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dsStep = currentStep as AlgorithmStep<DSStep> | null;
  const algoId = algorithmMeta?.id ?? "";
  const rendererType = DS_RENDERER_MAP[algoId] ?? "linear";

  const visualization = useMemo(() => {
    if (!dsStep?.data) {
      return (
        <div className="flex h-full items-center justify-center font-mono text-sm text-text-muted">
          Select a data structure and run an operation to begin
        </div>
      );
    }

    const { structure, highlightNodes, highlightEdges } = dsStep.data;

    switch (rendererType) {
      case "linear":
        return (
          <LinearRenderer
            state={structure as StackState | QueueState | LinkedListState}
            highlightNodes={highlightNodes}
            highlightEdges={highlightEdges}
          />
        );

      case "tree": {
        if (structure.kind === "heap") {
          const heapState = structure as HeapState;
          const treeRoot = heapArrayToTree(heapState.array, 0);
          return (
            <div className="flex flex-col items-center gap-4">
              <TreeRenderer
                root={treeRoot}
                highlightNodes={highlightNodes}
                variant="circle"
              />
              <div className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
                Array: [{heapState.array.join(", ")}]
              </div>
            </div>
          );
        }
        if (structure.kind === "trie") {
          return (
            <TreeRenderer
              root={(structure as TrieState).root}
              highlightNodes={highlightNodes}
              highlightEdges={highlightEdges}
              variant="small-char"
            />
          );
        }
        if (structure.kind === "b-tree") {
          return (
            <TreeRenderer
              root={(structure as BTreeState).root}
              highlightNodes={highlightNodes}
              highlightEdges={highlightEdges}
              variant="wide-rect"
            />
          );
        }
        if (structure.kind === "huffman") {
          return (
            <TreeRenderer
              root={(structure as HuffmanState).root}
              highlightNodes={highlightNodes}
              highlightEdges={highlightEdges}
              variant="circle"
            />
          );
        }
        return (
          <TreeRenderer
            root={getTreeRoot(structure)}
            highlightNodes={highlightNodes}
            highlightEdges={highlightEdges}
            variant={getTreeVariant(algoId)}
          />
        );
      }

      case "hash":
        return (
          <HashRenderer
            state={structure as HashTableState}
            highlightNodes={highlightNodes}
          />
        );

      case "union-find":
        return (
          <UnionFindRenderer
            state={structure as UnionFindState}
            highlightNodes={highlightNodes}
            highlightEdges={highlightEdges}
          />
        );

      default:
        return null;
    }
  }, [dsStep, rendererType, algoId]);

  return (
    <div className="flex h-[calc(100dvh-4.75rem)] flex-col gap-3 p-4">
      <Tabs defaultValue="visualizer" className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
            <TabsTrigger value="repl">REPL Playground</TabsTrigger>
          </TabsList>

          <DSControls
            showMemoryLayout={showMemoryLayout}
            onMemoryLayoutChange={setShowMemoryLayout}
          />
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

              <div
                className="flex flex-1 items-center justify-center overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--border) 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              >
                {visualization}
              </div>

              {showMemoryLayout && dsStep?.data && (
                <MemoryLayout state={dsStep.data.structure} />
              )}

              <PostRunSummary />
            </div>

            <div className="hidden w-72 flex-col gap-2 overflow-y-auto lg:flex">
              <DSSidePanelContent showCallStack />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="repl" className="mt-3 flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <div
                className="flex flex-1 items-center justify-center overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--border) 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              >
                {visualization}
              </div>

              <DSRepl className="h-64 flex-shrink-0" />
            </div>

            <div className="hidden w-72 flex-col gap-2 overflow-y-auto lg:flex">
              <DSSidePanelContent showCallStack={false} />
            </div>
          </div>
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
              <DSSidePanelContent showCallStack />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

