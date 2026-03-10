"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  type Edge,
  type EdgeTypes,
  MiniMap,
  type Node,
  type NodeTypes,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  type ReactFlowInstance,
} from "@xyflow/react";

import { type GraphStep, SCC_COLORS } from "@/lib/algorithms/graph";
import { getThemeColors, PALETTE } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

import { GraphEdge, type GraphEdgeData } from "./graph-edge";
import { GraphNode, type GraphNodeData } from "./graph-node";

import "@xyflow/react/dist/style.css";

export type EditorMode = "select" | "addNode" | "addEdge" | "delete";

type FlowNode = Node<GraphNodeData>;
type FlowEdge = Edge<GraphEdgeData>;

interface GraphEditorProps {
  graphNodes: FlowNode[];
  graphEdges: FlowEdge[];
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange<FlowEdge>;
  onConnect: OnConnect;
  onAddNode: (x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  editorMode: EditorMode;
  currentStep: AlgorithmStep<GraphStep> | null;
  sourceNode?: string;
  directed: boolean;
  /** When false, nodes are draggable and pan uses middle mouse. When true (playing), graph is view-only. */
  isPlaying?: boolean;
  className?: string;
}

const nodeTypes: NodeTypes = {
  graphNode: GraphNode as unknown as NodeTypes["graphNode"],
};

const edgeTypes: EdgeTypes = {
  graphEdge: GraphEdge as unknown as EdgeTypes["graphEdge"],
};

function hasId(
  setOrObj: Set<string> | Record<string, unknown> | null | undefined,
  id: string,
): boolean {
  if (setOrObj == null) return false;
  if (typeof (setOrObj as Set<string>).has === "function")
    return (setOrObj as Set<string>).has(id);
  return id in (setOrObj as Record<string, unknown>);
}

function getDistance(
  dist: Map<string, number> | Record<string, number> | null | undefined,
  id: string,
): number | undefined {
  if (dist == null) return undefined;
  if (typeof (dist as Map<string, number>).get === "function")
    return (dist as Map<string, number>).get(id);
  return (dist as Record<string, number>)[id];
}

export function GraphEditor({
  graphNodes,
  graphEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onDeleteNode,
  onDeleteEdge,
  editorMode,
  currentStep,
  sourceNode,
  directed,
  isPlaying = false,
  className,
}: GraphEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rfInstance = useRef<ReactFlowInstance<any, any> | null>(null);
  const theme = getThemeColors();

  const step = currentStep?.data ?? null;

  const displayNodes = useMemo(() => {
    return graphNodes.map((node) => {
      const nodeData = { ...node.data };

      if (step) {
        if (sourceNode && node.id === sourceNode && !step.sccGroups?.length) {
          nodeData.state = "source";
        } else if (hasId(step.active, node.id)) {
          nodeData.state = "processing";
        } else if (hasId(step.visited, node.id)) {
          nodeData.state = "visited";
        } else {
          nodeData.state = "unvisited";
        }

        const dist = getDistance(step.distances, node.id);
        if (dist !== undefined) nodeData.distance = dist;

        if (step.sccGroups?.length) {
          const groupIdx = step.sccGroups.findIndex((g) => g.includes(node.id));
          if (groupIdx >= 0) {
            nodeData.sccGroup = groupIdx;
          }
        }

        if (step.topoOrder?.length) {
          const orderIdx = step.topoOrder.indexOf(node.id);
          if (orderIdx >= 0) {
            nodeData.topoOrder = orderIdx + 1;
          }
        }
      } else {
        nodeData.state = sourceNode === node.id ? "source" : "unvisited";
        nodeData.distance = undefined;
        nodeData.sccGroup = undefined;
        nodeData.topoOrder = undefined;
      }

      return { ...node, data: nodeData };
    });
  }, [graphNodes, step, sourceNode]);

  const displayEdges = useMemo(() => {
    return graphEdges.map((edge) => {
      const edgeData = { ...edge.data! };
      edgeData.directed = directed;

      if (step) {
        if (hasId(step.mstEdges, edge.id)) {
          edgeData.state = "accepted";
        } else if (step.currentEdge === edge.id) {
          edgeData.state = "examining";
        } else {
          edgeData.state = "default";
        }
      } else {
        edgeData.state = "default";
      }

      return {
        ...edge,
        data: edgeData,
        markerEnd: directed
          ? { type: "arrowclosed" as const, color: PALETTE.strokeMuted }
          : undefined,
      };
    });
  }, [graphEdges, step, directed]);

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (editorMode !== "addNode" || !rfInstance.current) return;
      const bounds = (event.target as HTMLElement)
        .closest(".react-flow")
        ?.getBoundingClientRect();
      if (!bounds) return;
      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      onAddNode(position.x, position.y);
    },
    [editorMode, onAddNode],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      if (editorMode === "delete") {
        onDeleteNode(node.id);
      }
    },
    [editorMode, onDeleteNode],
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: FlowEdge) => {
      if (editorMode === "delete") {
        onDeleteEdge(edge.id);
      }
    },
    [editorMode, onDeleteEdge],
  );

  const isInteractive = !isPlaying;

  return (
    <div className={className} data-tour="canvas">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={isInteractive ? onNodesChange : undefined}
        onEdgesChange={isInteractive ? onEdgesChange : undefined}
        onConnect={isInteractive ? onConnect : undefined}
        onPaneClick={isInteractive ? handlePaneClick : undefined}
        onNodeClick={isInteractive ? handleNodeClick : undefined}
        onEdgeClick={isInteractive ? handleEdgeClick : undefined}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(instance) => {
          rfInstance.current = instance;
        }}
        nodesDraggable={isInteractive}
        nodesConnectable={isInteractive && editorMode === "addEdge"}
        elementsSelectable={isInteractive && editorMode === "select"}
        panOnDrag={
          !isInteractive ? true : editorMode === "select" ? [2] : false
        }
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border)"
        />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as GraphNodeData;
            if (data.sccGroup !== undefined)
              return SCC_COLORS[data.sccGroup % SCC_COLORS.length];
            switch (data.state) {
              case "source":
                return theme.accentAmber;
              case "visited":
                return theme.accentGreen;
              case "active":
              case "processing":
                return theme.accentCyan;
              default:
                return PALETTE.strokeMuted;
            }
          }}
          maskColor="rgba(0,0,0,0.7)"
          className="!border-zinc-700 !bg-zinc-900/80"
        />
      </ReactFlow>
    </div>
  );
}
