import type { GraphConfig, GraphEdge, GraphNode } from "./types";

function node(id: string, label: string, x: number, y: number): GraphNode {
  return { id, label, x, y };
}

function edge(
  id: string,
  source: string,
  target: string,
  weight?: number,
): GraphEdge {
  return { id, source, target, weight };
}

export function completeGraph(n = 5): GraphConfig {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const cx = 300,
    cy = 250,
    r = 180;

  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    nodes.push(
      node(`n${i}`, `${i}`, cx + r * Math.cos(angle), cy + r * Math.sin(angle)),
    );
  }

  let eid = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const w = Math.floor(Math.random() * 9) + 1;
      edges.push(edge(`e${eid++}`, `n${i}`, `n${j}`, w));
    }
  }

  return { directed: false, weighted: true, nodes, edges, sourceNode: "n0" };
}

export function bipartiteGraph(): GraphConfig {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (let i = 0; i < 3; i++) {
    nodes.push(node(`a${i}`, `A${i}`, 150, 100 + i * 150));
    nodes.push(node(`b${i}`, `B${i}`, 450, 100 + i * 150));
  }

  let eid = 0;
  const pairs: [string, string][] = [
    ["a0", "b0"],
    ["a0", "b1"],
    ["a1", "b1"],
    ["a1", "b2"],
    ["a2", "b0"],
    ["a2", "b2"],
  ];
  for (const [s, t] of pairs) {
    edges.push(edge(`e${eid++}`, s, t, Math.floor(Math.random() * 9) + 1));
  }

  return { directed: false, weighted: true, nodes, edges, sourceNode: "a0" };
}

export function treeGraph(): GraphConfig {
  const nodes: GraphNode[] = [
    node("n0", "0", 300, 50),
    node("n1", "1", 150, 150),
    node("n2", "2", 450, 150),
    node("n3", "3", 75, 270),
    node("n4", "4", 225, 270),
    node("n5", "5", 375, 270),
    node("n6", "6", 525, 270),
  ];

  const edges: GraphEdge[] = [
    edge("e0", "n0", "n1", 4),
    edge("e1", "n0", "n2", 8),
    edge("e2", "n1", "n3", 2),
    edge("e3", "n1", "n4", 5),
    edge("e4", "n2", "n5", 3),
    edge("e5", "n2", "n6", 7),
  ];

  return { directed: false, weighted: true, nodes, edges, sourceNode: "n0" };
}

export function dagGraph(): GraphConfig {
  const nodes: GraphNode[] = [
    node("n0", "A", 100, 50),
    node("n1", "B", 300, 50),
    node("n2", "C", 500, 50),
    node("n3", "D", 200, 200),
    node("n4", "E", 400, 200),
    node("n5", "F", 300, 350),
  ];

  const edges: GraphEdge[] = [
    edge("e0", "n0", "n3"),
    edge("e1", "n0", "n1"),
    edge("e2", "n1", "n3"),
    edge("e3", "n1", "n4"),
    edge("e4", "n2", "n4"),
    edge("e5", "n3", "n5"),
    edge("e6", "n4", "n5"),
  ];

  return { directed: true, weighted: false, nodes, edges, sourceNode: "n0" };
}

export function cyclicGraph(): GraphConfig {
  const nodes: GraphNode[] = [
    node("n0", "0", 100, 100),
    node("n1", "1", 250, 50),
    node("n2", "2", 400, 100),
    node("n3", "3", 100, 300),
    node("n4", "4", 250, 350),
    node("n5", "5", 400, 300),
    node("n6", "6", 550, 200),
  ];

  // Two SCCs: {0,1,2} and {3,4,5}. Node 6 is a singleton. Bridges: 2->5, 2->6
  const edges: GraphEdge[] = [
    edge("e0", "n0", "n1"),
    edge("e1", "n1", "n2"),
    edge("e2", "n2", "n0"),
    edge("e3", "n3", "n4"),
    edge("e4", "n4", "n5"),
    edge("e5", "n5", "n3"),
    edge("e6", "n2", "n5"),
    edge("e7", "n2", "n6"),
  ];

  return { directed: true, weighted: false, nodes, edges, sourceNode: "n0" };
}

export function negativeEdgeGraph(): GraphConfig {
  const nodes: GraphNode[] = [
    node("n0", "S", 100, 200),
    node("n1", "A", 250, 80),
    node("n2", "B", 400, 80),
    node("n3", "C", 250, 320),
    node("n4", "D", 400, 320),
    node("n5", "T", 550, 200),
  ];

  const edges: GraphEdge[] = [
    edge("e0", "n0", "n1", 6),
    edge("e1", "n0", "n3", 7),
    edge("e2", "n1", "n2", 5),
    edge("e3", "n1", "n3", 8),
    edge("e4", "n2", "n5", -2),
    edge("e5", "n3", "n4", -3),
    edge("e6", "n4", "n2", 7),
    edge("e7", "n4", "n5", 9),
  ];

  return { directed: true, weighted: true, nodes, edges, sourceNode: "n0" };
}

export function randomConnectedGraph(n = 8, density = 0.35): GraphConfig {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const cx = 300,
    cy = 250,
    r = 200;

  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const jitterX = (Math.random() - 0.5) * 40;
    const jitterY = (Math.random() - 0.5) * 40;
    nodes.push(
      node(
        `n${i}`,
        `${i}`,
        cx + r * Math.cos(angle) + jitterX,
        cy + r * Math.sin(angle) + jitterY,
      ),
    );
  }

  let eid = 0;
  for (let i = 1; i < n; i++) {
    const j = Math.floor(Math.random() * i);
    edges.push(
      edge(`e${eid++}`, `n${j}`, `n${i}`, Math.floor(Math.random() * 15) + 1),
    );
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (
        Math.random() < density &&
        !edges.some(
          (e) =>
            (e.source === `n${i}` && e.target === `n${j}`) ||
            (e.source === `n${j}` && e.target === `n${i}`),
        )
      ) {
        edges.push(
          edge(
            `e${eid++}`,
            `n${i}`,
            `n${j}`,
            Math.floor(Math.random() * 15) + 1,
          ),
        );
      }
    }
  }

  return { directed: false, weighted: true, nodes, edges, sourceNode: "n0" };
}

export const GRAPH_PRESETS: { name: string; generator: () => GraphConfig }[] = [
  { name: "Complete (K5)", generator: () => completeGraph(5) },
  { name: "Bipartite", generator: bipartiteGraph },
  { name: "Tree", generator: treeGraph },
  { name: "DAG", generator: dagGraph },
  { name: "Cyclic (SCC)", generator: cyclicGraph },
  { name: "Negative Edges", generator: negativeEdgeGraph },
  { name: "Random (8 nodes)", generator: () => randomConnectedGraph(8, 0.35) },
];
