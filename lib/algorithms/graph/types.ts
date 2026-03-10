export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  directed?: boolean;
}

export interface GraphConfig {
  directed: boolean;
  weighted: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
  sourceNode?: string;
}

export interface GraphStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visited: Set<string>;
  active: Set<string>;
  currentEdge?: string;
  mstEdges?: Set<string>;
  distances?: Map<string, number>;
  predecessors?: Map<string, string | null>;
  sccGroups?: string[][];
  topoOrder?: string[];
  distMatrix?: number[][];
  floydK?: number;
  floydI?: number;
  floydJ?: number;
  negativeCycle?: boolean;
  /** Order in which nodes were first visited (BFS/DFS). */
  visitOrder?: string[];
  nodesExamined: number;
  edgesExamined: number;
}

export function buildAdjacencyList(
  nodes: GraphNode[],
  edges: GraphEdge[],
  directed: boolean,
): Map<string, { target: string; weight: number; edgeId: string }[]> {
  const adj = new Map<
    string,
    { target: string; weight: number; edgeId: string }[]
  >();
  for (const node of nodes) {
    adj.set(node.id, []);
  }
  for (const edge of edges) {
    adj.get(edge.source)?.push({
      target: edge.target,
      weight: edge.weight ?? 1,
      edgeId: edge.id,
    });
    if (!directed) {
      adj.get(edge.target)?.push({
        target: edge.source,
        weight: edge.weight ?? 1,
        edgeId: edge.id,
      });
    }
  }
  return adj;
}

export function makeStep(
  partial: Partial<GraphStep> & Pick<GraphStep, "nodes" | "edges">,
): GraphStep {
  return {
    visited: new Set(),
    active: new Set(),
    nodesExamined: 0,
    edgesExamined: 0,
    ...partial,
  };
}
