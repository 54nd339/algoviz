"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { AccessOrderPanel } from "@/components/visualizers/graph/access-order-panel";
import { DistanceTablePanel } from "@/components/visualizers/graph/distance-table-panel";
import { FloydWarshallMatrix } from "@/components/visualizers/graph/floyd-warshall-matrix";
import { GraphControls } from "@/components/visualizers/graph/graph-controls";
import { useGraphEditor } from "@/components/visualizers/graph/use-graph-editor";
import { getByCategory } from "@/lib/algorithms";
import { GRAPH_GENERATORS,type GraphStep } from "@/lib/algorithms/graph";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/graph";

const GraphEditorDynamic = dynamic(
  () =>
    import("@/components/visualizers/graph/graph-editor").then((m) => ({
      default: m.GraphEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 justify-center font-mono text-sm text-zinc-500">
        Loading graph editor...
      </div>
    ),
  },
);

export default function GraphClient() {
  const { currentStep, algorithmMeta, configure, reset, isPlaying } = useVisualizer();
  useAlgoFromUrl(
    "graph",
    GRAPH_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const algorithms = useMemo(() => getByCategory("graph"), []);

  const {
    directed,
    setEditorMode,
    editorMode,
    sourceNode,
    setSourceNode,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    nodeIds,
    buildConfig,
    handleConnect,
    handleAddNode,
    handleDeleteNode,
    handleDeleteEdge,
    handleDirectedChange,
    handleWeightedChange,
    weighted,
    loadPreset,
    handleRandomize,
    handleClear,
  } = useGraphEditor(reset, configure, algorithmMeta);

  const graphStep = currentStep as AlgorithmStep<GraphStep> | null;
  const algoId = algorithmMeta?.id;
  const isFloydWarshall = algoId === "graph-floyd-warshall";
  const isBFS = algoId === "graph-bfs";
  const isDFS = algoId === "graph-dfs";
  const isDijkstra = algoId === "graph-dijkstra";
  const isBellmanFord = algoId === "graph-bellman-ford";

  return (
    <VisualizerPageLayout
      controls={
        <GraphControls
          algorithms={algorithms}
          generators={
            GRAPH_GENERATORS as Record<
              string,
              (input: unknown) => Generator<never, void, undefined>
            >
          }
          defaultInput={buildConfig()}
          editorMode={editorMode}
          onEditorModeChange={setEditorMode}
          directed={directed}
          onDirectedChange={handleDirectedChange}
          weighted={weighted}
          onWeightedChange={handleWeightedChange}
          sourceNode={sourceNode}
          nodeIds={nodeIds}
          onSourceNodeChange={setSourceNode}
          onPresetLoad={loadPreset}
          onRandomize={handleRandomize}
          onClear={handleClear}
        />
      }
      canvas={
        <div className="flex-1 overflow-hidden rounded-lg border border-border bg-bg-primary/50">
          <GraphEditorDynamic
            graphNodes={nodes}
            graphEdges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={handleDeleteEdge}
            editorMode={editorMode}
            currentStep={graphStep}
            sourceNode={sourceNode}
            directed={directed}
            isPlaying={isPlaying}
            className="h-full w-full"
          />
        </div>
      }
      showCallStack
      extraSidePanels={
        <>
          {isFloydWarshall && graphStep?.data?.distMatrix && (
            <FloydWarshallMatrix
              step={graphStep.data}
              nodes={graphStep.data.nodes}
            />
          )}
          {(isBFS || isDFS) && graphStep?.data && (
            <AccessOrderPanel
              step={graphStep.data}
              nodes={graphStep.data.nodes}
              title={isBFS ? "BFS access order" : "DFS access order"}
            />
          )}
          {(isDijkstra || isBellmanFord) && graphStep?.data?.distances && (
            <DistanceTablePanel
              step={graphStep.data}
              nodes={graphStep.data.nodes}
              title={
                isDijkstra ? "Dijkstra distances" : "Bellman-Ford distances"
              }
            />
          )}
        </>
      }
    />
  );
}
