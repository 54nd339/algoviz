"use client";

import { useCallback, useMemo, useState } from "react";
import { addEdge, type Connection, type Edge, type Node, useEdgesState, useNodesState } from "@xyflow/react";

import { type GraphEdgeData } from "@/components/visualizers/graph/graph-edge";
import { type EditorMode } from "@/components/visualizers/graph/graph-editor";
import { type GraphNodeData } from "@/components/visualizers/graph/graph-node";
import type { GraphConfig } from "@/lib/algorithms/graph";
import { GRAPH_GENERATORS, GRAPH_PRESETS } from "@/lib/algorithms/graph";
import { randomConnectedGraph } from "@/lib/algorithms/graph/presets";
import {
  buildConfig as buildGraphConfig,
  toFlowEdges,
  toFlowNodes,
} from "@/lib/algorithms/graph/transform";
import type { AlgorithmMeta } from "@/types";

const DEFAULT_CONFIG = randomConnectedGraph(6, 0.3);

export function useGraphEditor(
  reset: () => void,
  configure: ReturnType<typeof import("@/hooks/use-visualizer").useVisualizer>["configure"],
  algorithmMeta: AlgorithmMeta | null,
) {
  const [directed, setDirected] = useState(DEFAULT_CONFIG.directed);
  const [weighted, setWeighted] = useState(DEFAULT_CONFIG.weighted);
  const [sourceNode, setSourceNode] = useState(
    DEFAULT_CONFIG.sourceNode ?? DEFAULT_CONFIG.nodes[0]?.id ?? "",
  );
  const [editorMode, setEditorMode] = useState<EditorMode>("select");
  const [nextNodeId, setNextNodeId] = useState(DEFAULT_CONFIG.nodes.length);
  const [nextEdgeId, setNextEdgeId] = useState(DEFAULT_CONFIG.edges.length);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<GraphNodeData>>(toFlowNodes(DEFAULT_CONFIG));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<GraphEdgeData>>(toFlowEdges(DEFAULT_CONFIG));

  const nodeIds = useMemo(
    () => nodes.map((n) => ({ id: n.id, label: (n.data as GraphNodeData).label })),
    [nodes],
  );

  const buildConfig = useCallback(
    (overrides?: Parameters<typeof buildGraphConfig>[1]): GraphConfig =>
      buildGraphConfig({ nodes, edges, directed, weighted, sourceNode }, overrides),
    [nodes, edges, directed, weighted, sourceNode],
  );

  const reconfigure = useCallback(
    (overrides?: Parameters<typeof buildConfig>[0]) => {
      if (!algorithmMeta) return;
      const gen = GRAPH_GENERATORS[algorithmMeta.id];
      if (!gen) return;
      const config = buildConfig(overrides);
      configure(algorithmMeta, gen, config);
    },
    [algorithmMeta, buildConfig, configure],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const eid = `e${nextEdgeId}`;
      setNextEdgeId((id) => id + 1);
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: eid,
            type: "graphEdge",
            data: {
              weight: weighted ? Math.floor(Math.random() * 9) + 1 : undefined,
              state: "default" as const,
              directed,
            },
          },
          eds,
        ),
      );
      reset();
    },
    [nextEdgeId, weighted, directed, setEdges, reset],
  );

  const handleAddNode = useCallback(
    (x: number, y: number) => {
      const id = `n${nextNodeId}`;
      setNextNodeId((n) => n + 1);
      setNodes((nds) => [
        ...nds,
        {
          id,
          position: { x, y },
          type: "graphNode",
          data: { label: `${nextNodeId}`, state: "unvisited" as const },
        },
      ]);
      reset();
    },
    [nextNodeId, setNodes, reset],
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      if (sourceNode === id) {
        setSourceNode((prev) => {
          const remaining = nodes.filter((n) => n.id !== id);
          return remaining[0]?.id ?? prev;
        });
      }
      reset();
    },
    [nodes, sourceNode, setNodes, setEdges, reset],
  );

  const handleDeleteEdge = useCallback(
    (id: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== id));
      reset();
    },
    [setEdges, reset],
  );

  const handleDirectedChange = useCallback(
    (dir: boolean) => {
      setDirected(dir);
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          data: { ...e.data!, directed: dir },
        })),
      );
      reset();
    },
    [setEdges, reset],
  );

  const handleWeightedChange = useCallback(
    (wt: boolean) => {
      setWeighted(wt);
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          data: {
            ...e.data!,
            weight: wt
              ? ((e.data as GraphEdgeData)?.weight ?? Math.floor(Math.random() * 9) + 1)
              : undefined,
          },
        })),
      );
      reset();
    },
    [setEdges, reset],
  );

  const loadPreset = useCallback(
    (presetName: string) => {
      const preset = GRAPH_PRESETS.find((p) => p.name === presetName);
      if (!preset) return;
      const config = preset.generator();
      const flowNodes = toFlowNodes(config);
      const flowEdges = toFlowEdges(config);
      setNodes(flowNodes);
      setEdges(flowEdges);
      setDirected(config.directed);
      setWeighted(config.weighted);
      setSourceNode(config.sourceNode ?? config.nodes[0]?.id ?? "");
      setNextNodeId(config.nodes.length);
      setNextEdgeId(config.edges.length);
      reset();
    },
    [setNodes, setEdges, reset],
  );

  const handleRandomize = useCallback(() => {
    const config = randomConnectedGraph(8, 0.35);
    const flowNodes = toFlowNodes({ ...config, directed, weighted });
    const flowEdges = toFlowEdges({ ...config, directed, weighted });
    setNodes(flowNodes);
    setEdges(flowEdges);
    setSourceNode(config.sourceNode ?? config.nodes[0]?.id ?? "");
    setNextNodeId(config.nodes.length);
    setNextEdgeId(config.edges.length);
    reset();
  }, [directed, weighted, setNodes, setEdges, reset]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNextNodeId(0);
    setNextEdgeId(0);
    reset();
  }, [setNodes, setEdges, reset]);

  return {
    directed,
    setDirected,
    weighted,
    setWeighted,
    sourceNode,
    setSourceNode,
    editorMode,
    setEditorMode,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    nodeIds,
    buildConfig,
    reconfigure,
    handleConnect,
    handleAddNode,
    handleDeleteNode,
    handleDeleteEdge,
    handleDirectedChange,
    handleWeightedChange,
    loadPreset,
    handleRandomize,
    handleClear,
  };
}
