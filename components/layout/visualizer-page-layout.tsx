"use client";

import { useState } from "react";
import { PanelRightOpen, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { AlgorithmInfoDrawer } from "@/components/visualizers/shared/algorithm-info-drawer";
import { CallStackPanel } from "@/components/visualizers/shared/call-stack-panel";
import { CodePanel } from "@/components/visualizers/shared/code-panel";
import { PlayerControls } from "@/components/visualizers/shared/player-controls";
import { PostRunSummary } from "@/components/visualizers/shared/post-run-summary";
import { VariableWatchPanel } from "@/components/visualizers/shared/variable-watch-panel";

interface VisualizerPageLayoutProps {
  controls: React.ReactNode;
  canvas: React.ReactNode;
  onBeforePlay?: () => void;
  showPlayerControls?: boolean;
  showPostRunSummary?: boolean;
  showSidePanel?: boolean;
  showCallStack?: boolean;
  extraSidePanels?: React.ReactNode;
  afterCanvas?: React.ReactNode;
}

function SidePanelContent({
  showCallStack,
  showPostRunSummary,
  extraSidePanels,
}: Pick<
  VisualizerPageLayoutProps,
  "showCallStack" | "extraSidePanels" | "showPostRunSummary"
>) {
  return (
    <>
      {showPostRunSummary && <PostRunSummary />}
      <CodePanel />
      <VariableWatchPanel />
      {showCallStack && <CallStackPanel />}
      {extraSidePanels}
      <AlgorithmInfoDrawer />
    </>
  );
}

function MobileInfoPanel({
  showCallStack,
  showPostRunSummary,
  extraSidePanels,
}: Pick<
  VisualizerPageLayoutProps,
  "showCallStack" | "extraSidePanels" | "showPostRunSummary"
>) {
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
          {showPostRunSummary && <PostRunSummary className="p-3" />}
          <VariableWatchPanel className="border-0" />
          {showCallStack && <CallStackPanel className="border-0" />}
          {extraSidePanels}
        </TabsContent>
        <TabsContent value="info" className="mt-0 max-h-56 overflow-y-auto p-0">
          <AlgorithmInfoDrawer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function VisualizerPageLayout({
  controls,
  canvas,
  onBeforePlay,
  showPlayerControls = true,
  showPostRunSummary = true,
  showSidePanel = true,
  showCallStack = false,
  extraSidePanels,
  afterCanvas,
}: VisualizerPageLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-4.75rem)] flex-col gap-3 overflow-y-auto p-4 lg:overflow-hidden">
      {controls}

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {showPlayerControls && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <PlayerControls onBeforePlay={onBeforePlay} />
              </div>
              {showSidePanel && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open side panel"
                >
                  <PanelRightOpen size={18} />
                </Button>
              )}
            </div>
          )}
          {canvas}
          {afterCanvas}

          {showSidePanel && (
            <MobileInfoPanel
              showCallStack={showCallStack}
              showPostRunSummary={showPostRunSummary}
              extraSidePanels={extraSidePanels}
            />
          )}
        </div>

        {showSidePanel && (
          <div className="hidden w-72 shrink-0 flex-col gap-2 overflow-y-auto lg:flex">
            <SidePanelContent
              showCallStack={showCallStack}
              showPostRunSummary={showPostRunSummary}
              extraSidePanels={extraSidePanels}
            />
          </div>
        )}
      </div>

      {showSidePanel && (
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
                <SidePanelContent
                  showCallStack={showCallStack}
                  showPostRunSummary={showPostRunSummary}
                  extraSidePanels={extraSidePanels}
                />
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </div>
  );
}
