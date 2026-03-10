import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GeometryStep, Point, VoronoiEdge } from "./types";

export const voronoiMeta: AlgorithmMeta = {
  id: "voronoi-diagram",
  name: "Voronoi Diagram",
  category: "geometry",
  description:
    "Partitions a plane into regions, where each region contains all points closer to one site than any other. Built incrementally by computing perpendicular bisectors.",
  timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
  spaceComplexity: "O(n²)",
  pseudocode: `function voronoi(sites):
  edges = []
  for each pair (si, sj):
    bisector = perpBisector(si, sj)
    clip bisector to bounding box
    edges.push(clipped bisector)
  return edges`,
  presets: [
    {
      name: "Random (8 sites)",
      generator: () => randomPoints(8),
      expectedCase: "average",
    },
    {
      name: "Grid (9 sites)",
      generator: () => gridPoints(),
      expectedCase: "average",
    },
    {
      name: "Clustered (10 sites)",
      generator: () => clusteredPoints(),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Voronoi diagrams require Fortune's sweep line algorithm.",
      reality:
        "Fortune's is optimal O(n log n), but simpler O(n²) approaches work well for visualization with small point sets.",
    },
  ],
  relatedAlgorithms: ["graham-scan", "jarvis-march"],
};

registerAlgorithm(voronoiMeta);

function randomPoints(n: number): Point[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.round(Math.random() * 480 + 60),
    y: Math.round(Math.random() * 380 + 60),
    id: `s${i}`,
  }));
}

function gridPoints(): Point[] {
  const pts: Point[] = [];
  let id = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      pts.push({ x: 150 + c * 150, y: 120 + r * 140, id: `s${id++}` });
    }
  }
  return pts;
}

function clusteredPoints(): Point[] {
  const centers = [
    { x: 150, y: 200 },
    { x: 400, y: 150 },
    { x: 300, y: 400 },
  ];
  const pts: Point[] = [];
  let id = 0;
  for (const c of centers) {
    for (let i = 0; i < 3; i++) {
      pts.push({
        x: Math.round(c.x + (Math.random() - 0.5) * 80),
        y: Math.round(c.y + (Math.random() - 0.5) * 80),
        id: `s${id++}`,
      });
    }
  }
  pts.push({ x: 500, y: 400, id: `s${id}` });
  return pts;
}

const BOUND = { minX: 0, minY: 0, maxX: 600, maxY: 500 };

function perpBisectorEdge(a: Point, b: Point): VoronoiEdge | null {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (dx === 0 && dy === 0) return null;

  const nx = -dy;
  const ny = dx;
  const len = Math.sqrt(nx * nx + ny * ny);
  const ux = nx / len;
  const uy = ny / len;

  const T = 1000;
  const x1 = mx - ux * T;
  const y1 = my - uy * T;
  const x2 = mx + ux * T;
  const y2 = my + uy * T;

  // Clip to bounding box using Cohen-Sutherland-style clipping
  const result = clipLine(x1, y1, x2, y2);
  if (!result) return null;

  return {
    p1: { x: result.x1, y: result.y1 },
    p2: { x: result.x2, y: result.y2 },
  };
}

function clipLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { x1: number; y1: number; x2: number; y2: number } | null {
  const { minX, minY, maxX, maxY } = BOUND;
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;

  for (const [p, q] of [
    [-dx, x1 - minX],
    [dx, maxX - x1],
    [-dy, y1 - minY],
    [dy, maxY - y1],
  ]) {
    if (Math.abs(p) < 1e-10) {
      if (q < 0) return null;
    } else {
      const r = q / p;
      if (p < 0) {
        if (r > t1) return null;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return null;
        if (r < t1) t1 = r;
      }
    }
  }

  return {
    x1: Math.round(x1 + t0 * dx),
    y1: Math.round(y1 + t0 * dy),
    x2: Math.round(x1 + t1 * dx),
    y2: Math.round(y1 + t1 * dy),
  };
}

export function* voronoi(input: Point[]): AlgorithmGenerator<GeometryStep> {
  const points = [...input];
  const edges: VoronoiEdge[] = [];

  yield {
    type: "init",
    data: { points: [...points], voronoiEdges: [] },
    description: `Voronoi Diagram: ${points.length} sites`,
    codeLine: 1,
    variables: { n: points.length },
  };

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];

      yield {
        type: "sweep",
        data: {
          points: [...points],
          voronoiEdges: [...edges],
          currentEdge: [a, b],
          candidatePoint: a,
          message: `Computing bisector between ${a.id} and ${b.id}`,
        },
        description: `Bisector between ${a.id} and ${b.id}`,
        codeLine: 3,
        variables: { site1: a.id, site2: b.id },
      };

      const edge = perpBisectorEdge(a, b);
      if (edge) {
        edges.push(edge);

        yield {
          type: "add-edge",
          data: {
            points: [...points],
            voronoiEdges: [...edges],
            currentEdge: [a, b],
          },
          description: `Added bisector edge for ${a.id}–${b.id}`,
          codeLine: 5,
          variables: { edges: edges.length },
        };
      }
    }
  }

  yield {
    type: "done",
    data: {
      points: [...points],
      voronoiEdges: [...edges],
    },
    description: `Voronoi complete! ${edges.length} bisector edges for ${points.length} sites`,
    variables: { edgeCount: edges.length, sites: points.length },
  };
}
