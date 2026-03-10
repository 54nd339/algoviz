import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GeometryStep, Point } from "./types";

export const jarvisMarchMeta: AlgorithmMeta = {
  id: "jarvis-march",
  name: "Jarvis March",
  category: "geometry",
  description:
    "Gift-wrapping algorithm: starting from the leftmost point, repeatedly selects the point that makes the smallest counter-clockwise angle from the current edge direction.",
  timeComplexity: { best: "O(nh)", average: "O(nh)", worst: "O(n²)" },
  spaceComplexity: "O(h)",
  pseudocode: `function jarvisMarch(points):
  start = leftmost point
  hull = [start]
  current = start
  do:
    next = points[0]
    for each point p in points:
      if cross(current, next, p) > 0:
        next = p
    hull.push(next)
    current = next
  while current != start
  return hull`,
  presets: [
    {
      name: "Random (12 points)",
      generator: () => randomPoints(12),
      expectedCase: "average",
    },
    {
      name: "Few Hull Points",
      generator: () => fewHullPoints(),
      expectedCase: "best",
    },
    {
      name: "All on Hull (8)",
      generator: () => allOnHull(8),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Jarvis March is always slower than Graham Scan.",
      reality:
        "Jarvis March is O(nh), so it can be faster when h (hull size) is small relative to n.",
    },
  ],
  relatedAlgorithms: ["graham-scan"],
};

registerAlgorithm(jarvisMarchMeta);

function randomPoints(n: number): Point[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.round(Math.random() * 500 + 50),
    y: Math.round(Math.random() * 400 + 50),
    id: `p${i}`,
  }));
}

function fewHullPoints(): Point[] {
  const pts: Point[] = [
    { x: 50, y: 300, id: "p0" },
    { x: 550, y: 300, id: "p1" },
    { x: 300, y: 50, id: "p2" },
    { x: 300, y: 450, id: "p3" },
  ];
  for (let i = 4; i < 12; i++) {
    pts.push({
      x: Math.round(200 + Math.random() * 200),
      y: Math.round(150 + Math.random() * 200),
      id: `p${i}`,
    });
  }
  return pts;
}

function allOnHull(n: number): Point[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return {
      x: Math.round(300 + 200 * Math.cos(angle)),
      y: Math.round(250 + 180 * Math.sin(angle)),
      id: `p${i}`,
    };
  });
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function dist2(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function* jarvisMarch(input: Point[]): AlgorithmGenerator<GeometryStep> {
  const points = [...input];

  yield {
    type: "init",
    data: { points: [...points] },
    description: `Jarvis March on ${points.length} points`,
    codeLine: 1,
    variables: { n: points.length },
  };

  if (points.length < 3) {
    yield {
      type: "done",
      data: { points: [...points], hull: [...points] },
      description: "Degenerate case (fewer than 3 points)",
    };
    return;
  }

  // Find leftmost point
  let leftmost = 0;
  for (let i = 1; i < points.length; i++) {
    if (
      points[i].x < points[leftmost].x ||
      (points[i].x === points[leftmost].x && points[i].y < points[leftmost].y)
    ) {
      leftmost = i;
    }
  }

  const start = points[leftmost];
  yield {
    type: "select-start",
    data: {
      points: [...points],
      hull: [start],
      candidatePoint: start,
    },
    description: `Starting from leftmost point: ${start.id}`,
    codeLine: 2,
    variables: { start: start.id },
  };

  const hull: Point[] = [start];
  let current = start;

  do {
    let next = points[0];
    if (next.id === current.id) next = points[1];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.id === current.id) continue;

      yield {
        type: "compare-angle",
        data: {
          points: [...points],
          hull: [...hull],
          currentEdge: [current, p],
          candidatePoint: next,
        },
        description: `Comparing ${p.id} against current best ${next.id}`,
        codeLine: 7,
        variables: {
          current: current.id,
          candidate: p.id,
          currentBest: next.id,
        },
      };

      const c = cross(current, next, p);
      if (c > 0 || (c === 0 && dist2(current, p) > dist2(current, next))) {
        next = p;
      }
    }

    hull.push(next);

    yield {
      type: "add-edge",
      data: {
        points: [...points],
        hull: [...hull],
        currentEdge: [current, next],
      },
      description: `Hull edge: ${current.id} → ${next.id}`,
      codeLine: 9,
      variables: {
        from: current.id,
        to: next.id,
        hullSize: hull.length,
      },
    };

    current = next;
  } while (current.id !== start.id);

  hull.pop();

  yield {
    type: "done",
    data: {
      points: [...points],
      hull: [...hull],
    },
    description: `Convex hull complete! ${hull.length} vertices`,
    variables: { hullSize: hull.length, hull: hull.map((p) => p.id) },
  };
}
