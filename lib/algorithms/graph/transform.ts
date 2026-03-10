import type { Edge, Node } from "@xyflow/react";

import type { GraphConfig, GraphEdge, GraphNode } from "./types";

/** Minimal node data shape for React Flow graph nodes */
export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  state: "unvisited" | "active" | "visited" | "source" | "processing";
}

/** Minimal edge data shape for React Flow graph edges */
export interface FlowEdgeData extends Record<string, unknown> {
  weight?: number;
  state: "default" | "examining" | "accepted" | "rejected";
  directed?: boolean;
}

/**
 * Converts GraphConfig to React Flow nodes.
 */
export function toFlowNodes(config: GraphConfig): Node<FlowNodeData>[] {
  return config.nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    type: "graphNode",
    data: {
      label: n.label,
      state: n.id === config.sourceNode ? "source" : ("unvisited" as const),
    },
  }));
}

/**
 * Converts GraphConfig to React Flow edges.
 */
export function toFlowEdges(config: GraphConfig): Edge<FlowEdgeData>[] {
  return config.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "graphEdge",
    data: {
      weight: config.weighted ? (e.weight ?? 1) : undefined,
      state: "default" as const,
      directed: config.directed,
    },
  }));
}

export interface BuildConfigParams {
  nodes: Node<FlowNodeData>[];
  edges: Edge<FlowEdgeData>[];
  directed: boolean;
  weighted: boolean;
  sourceNode: string;
}

export interface BuildConfigOverrides {
  nodes?: Node<FlowNodeData>[];
  edges?: Edge<FlowEdgeData>[];
  dir?: boolean;
  wt?: boolean;
  src?: string;
}

/**
 * Builds GraphConfig from React Flow nodes/edges and options.
 */
export function buildConfig(
  params: BuildConfigParams,
  overrides?: BuildConfigOverrides,
): GraphConfig {
  const ns = overrides?.nodes ?? params.nodes;
  const es = overrides?.edges ?? params.edges;
  const dir = overrides?.dir ?? params.directed;
  const wt = overrides?.wt ?? params.weighted;
  const src = overrides?.src ?? params.sourceNode;

  const nodes: GraphNode[] = ns.map((n) => ({
    id: n.id,
    label: n.data.label,
    x: n.position.x,
    y: n.position.y,
  }));

  const edges: GraphEdge[] = es.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    weight: wt ? (e.data?.weight ?? 1) : undefined,
    directed: dir,
  }));

  return {
    directed: dir,
    weighted: wt,
    sourceNode: src,
    nodes,
    edges,
  };
}
