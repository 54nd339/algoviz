import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GeometryStep, Point } from "./types";

export const grahamScanMeta: AlgorithmMeta = {
  id: "graham-scan",
  name: "Graham Scan",
  category: "geometry",
  description:
    "Finds the convex hull by sorting points by polar angle from the lowest point, then processing them in order while maintaining only counter-clockwise turns.",
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
  },
  spaceComplexity: "O(n)",
  pseudocode: `function grahamScan(points):
  p0 = lowest point (min y, then min x)
  sort remaining by polar angle w.r.t. p0
  stack = [p0, sorted[0], sorted[1]]
  for i = 2 to n-1:
    while ccw(stack[-2], stack[-1], sorted[i]) <= 0:
      stack.pop()
    stack.push(sorted[i])
  return stack`,
  presets: [
    {
      name: "Random (12 points)",
      generator: () => randomPoints(12),
      expectedCase: "average",
    },
    {
      name: "Circle (10 points)",
      generator: () => circlePoints(10),
      expectedCase: "best",
    },
    {
      name: "Collinear + Outliers",
      generator: () => collinearPoints(),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Graham Scan works in O(n) time.",
      reality:
        "The sort step is O(n log n); the stack processing is O(n). Total is O(n log n).",
    },
  ],
  relatedAlgorithms: ["jarvis-march"],
};

registerAlgorithm(grahamScanMeta);

function randomPoints(n: number): Point[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.round(Math.random() * 500 + 50),
    y: Math.round(Math.random() * 400 + 50),
    id: `p${i}`,
  }));
}

function circlePoints(n: number): Point[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return {
      x: Math.round(300 + 200 * Math.cos(angle)),
      y: Math.round(250 + 180 * Math.sin(angle)),
      id: `p${i}`,
    };
  });
}

function collinearPoints(): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < 6; i++) {
    pts.push({ x: 100 + i * 80, y: 300, id: `p${i}` });
  }
  pts.push({ x: 300, y: 100, id: "p6" });
  pts.push({ x: 300, y: 450, id: "p7" });
  return pts;
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function polarAngle(ref: Point, p: Point): number {
  return Math.atan2(p.y - ref.y, p.x - ref.x);
}

function dist2(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function* grahamScan(input: Point[]): AlgorithmGenerator<GeometryStep> {
  const points = [...input];

  yield {
    type: "init",
    data: { points: [...points] },
    description: `Graham Scan on ${points.length} points`,
    codeLine: 1,
    variables: { n: points.length },
  };

  // Find lowest point
  let lowest = 0;
  for (let i = 1; i < points.length; i++) {
    if (
      points[i].y > points[lowest].y ||
      (points[i].y === points[lowest].y && points[i].x < points[lowest].x)
    ) {
      lowest = i;
    }
  }
  [points[0], points[lowest]] = [points[lowest], points[0]];
  const p0 = points[0];

  yield {
    type: "find-lowest",
    data: {
      points: [...points],
      anchorPoint: p0,
      candidatePoint: p0,
    },
    description: `Anchor point: ${p0.id} at (${p0.x}, ${p0.y})`,
    codeLine: 2,
    variables: { anchor: p0.id, x: p0.x, y: p0.y },
  };

  // Sort by polar angle
  const rest = points.slice(1);
  rest.sort((a, b) => {
    const angleA = polarAngle(p0, a);
    const angleB = polarAngle(p0, b);
    if (Math.abs(angleA - angleB) < 1e-10) return dist2(p0, a) - dist2(p0, b);
    return angleA - angleB;
  });
  const sorted = [p0, ...rest];

  yield {
    type: "sort-polar",
    data: {
      points: [...sorted],
      anchorPoint: p0,
      sortedPoints: [...sorted],
    },
    description: "Points sorted by polar angle from anchor",
    codeLine: 3,
    variables: { sortedOrder: sorted.map((p) => p.id) },
  };

  if (sorted.length < 3) {
    yield {
      type: "done",
      data: { points: [...sorted], hull: [...sorted] },
      description: `Convex hull: ${sorted.length} points (degenerate case)`,
      variables: { hullSize: sorted.length },
    };
    return;
  }

  const stack: Point[] = [sorted[0], sorted[1], sorted[2]];

  yield {
    type: "push",
    data: {
      points: [...sorted],
      hull: [...stack],
      stackPoints: [...stack],
      anchorPoint: p0,
    },
    description: `Initial stack: ${stack.map((p) => p.id).join(", ")}`,
    codeLine: 4,
    variables: { stack: stack.map((p) => p.id) },
  };

  for (let i = 3; i < sorted.length; i++) {
    const candidate = sorted[i];

    yield {
      type: "consider",
      data: {
        points: [...sorted],
        hull: [...stack],
        candidatePoint: candidate,
        currentEdge: [stack[stack.length - 1], candidate],
        stackPoints: [...stack],
        anchorPoint: p0,
      },
      description: `Considering ${candidate.id}`,
      codeLine: 5,
      variables: {
        candidate: candidate.id,
        stackTop: stack[stack.length - 1].id,
      },
    };

    while (
      stack.length > 1 &&
      cross(stack[stack.length - 2], stack[stack.length - 1], candidate) <= 0
    ) {
      const removed = stack.pop()!;

      yield {
        type: "reject",
        data: {
          points: [...sorted],
          hull: [...stack],
          candidatePoint: candidate,
          currentEdge:
            stack.length > 0 ? [stack[stack.length - 1], candidate] : undefined,
          stackPoints: [...stack],
          anchorPoint: p0,
          message: `Removed ${removed.id} (clockwise turn)`,
        },
        description: `Popped ${removed.id} — not a CCW turn`,
        codeLine: 6,
        variables: {
          removed: removed.id,
          turn: "clockwise",
          stackSize: stack.length,
        },
      };
    }

    stack.push(candidate);

    yield {
      type: "push",
      data: {
        points: [...sorted],
        hull: [...stack],
        stackPoints: [...stack],
        anchorPoint: p0,
      },
      description: `Pushed ${candidate.id} onto stack`,
      codeLine: 7,
      variables: { stack: stack.map((p) => p.id) },
    };
  }

  yield {
    type: "done",
    data: {
      points: [...sorted],
      hull: [...stack],
      stackPoints: [...stack],
      anchorPoint: p0,
    },
    description: `Convex hull complete! ${stack.length} vertices`,
    variables: { hullSize: stack.length, hull: stack.map((p) => p.id) },
  };
}
