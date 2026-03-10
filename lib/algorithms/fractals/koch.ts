import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { FractalShape, RecursiveFractalStep } from "./types";

export const kochMeta: AlgorithmMeta = {
  id: "koch",
  name: "Koch Snowflake",
  category: "fractals",
  description:
    "Starting with an equilateral triangle, each edge is divided into thirds and the middle third is replaced with two sides of a smaller equilateral triangle. The resulting curve has infinite length but encloses finite area.",
  timeComplexity: { best: "O(4ⁿ)", average: "O(4ⁿ)", worst: "O(4ⁿ)" },
  spaceComplexity: "O(4ⁿ)",
  pseudocode: `function koch(p1, p2, depth):
  if depth == 0:
    draw line(p1, p2)
    return
  a = p1 + (p2 - p1) / 3
  b = p1 + 2·(p2 - p1) / 3
  peak = rotate(b - a, -60°) + a
  koch(p1, a, depth - 1)
  koch(a, peak, depth - 1)
  koch(peak, b, depth - 1)
  koch(b, p2, depth - 1)`,
  presets: [
    {
      name: "Iteration 4",
      generator: () => ({ maxDepth: 4 }),
      expectedCase: "average",
    },
    {
      name: "Iteration 6",
      generator: () => ({ maxDepth: 6 }),
      expectedCase: "worst",
    },
    {
      name: "Iteration 2",
      generator: () => ({ maxDepth: 2 }),
      expectedCase: "best",
    },
  ],
};

registerAlgorithm(kochMeta);

interface Point {
  x: number;
  y: number;
}

function kochSegments(p1: Point, p2: Point, depth: number): FractalShape[] {
  if (depth === 0) {
    return [{ type: "line", points: [p1, p2], depth: 0 }];
  }

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const a: Point = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
  const b: Point = { x: p1.x + (2 * dx) / 3, y: p1.y + (2 * dy) / 3 };
  const angle = -Math.PI / 3;
  const peak: Point = {
    x: a.x + (b.x - a.x) * Math.cos(angle) - (b.y - a.y) * Math.sin(angle),
    y: a.y + (b.x - a.x) * Math.sin(angle) + (b.y - a.y) * Math.cos(angle),
  };

  return [
    ...kochSegments(p1, a, depth - 1),
    ...kochSegments(a, peak, depth - 1),
    ...kochSegments(peak, b, depth - 1),
    ...kochSegments(b, p2, depth - 1),
  ];
}

export function* koch(input: {
  maxDepth: number;
}): AlgorithmGenerator<RecursiveFractalStep> {
  const { maxDepth } = input;
  const size = 500;
  const h = (size * Math.sqrt(3)) / 2;
  const cx = size / 2;
  const cy = h * 0.6;

  const v0: Point = { x: cx, y: cy - (2 * h) / 3 };
  const v1: Point = { x: cx - size / 2, y: cy + h / 3 };
  const v2: Point = { x: cx + size / 2, y: cy + h / 3 };

  yield {
    type: "init",
    data: {
      shapes: [
        { type: "line", points: [v0, v1], depth: 0 },
        { type: "line", points: [v1, v2], depth: 0 },
        { type: "line", points: [v2, v0], depth: 0 },
      ],
      depth: 0,
      maxDepth,
      fractalType: "koch",
    },
    description: "Starting with equilateral triangle (3 edges)",
    codeLine: 1,
    variables: { depth: 0, maxDepth, segments: 3 },
  };

  for (let d = 1; d <= maxDepth; d++) {
    const allSegments = [
      ...kochSegments(v0, v1, d),
      ...kochSegments(v1, v2, d),
      ...kochSegments(v2, v0, d),
    ];

    const shapes: FractalShape[] = allSegments.map((s) => ({
      ...s,
      depth: d,
    }));

    yield {
      type: "recurse",
      data: { shapes, depth: d, maxDepth, fractalType: "koch" },
      description: `Iteration ${d}: ${shapes.length} segments`,
      codeLine: d <= 1 ? 5 : 8,
      variables: { depth: d, segments: shapes.length },
      callStack: [{ name: "koch", args: { depth: d, maxDepth } }],
    };
  }

  const finalSegments = [
    ...kochSegments(v0, v1, maxDepth),
    ...kochSegments(v1, v2, maxDepth),
    ...kochSegments(v2, v0, maxDepth),
  ];

  yield {
    type: "done",
    data: {
      shapes: finalSegments.map((s) => ({ ...s, depth: maxDepth })),
      depth: maxDepth,
      maxDepth,
      fractalType: "koch",
    },
    description: `Koch snowflake complete: ${finalSegments.length} segments at iteration ${maxDepth}`,
    codeLine: 11,
    variables: { totalSegments: finalSegments.length },
  };
}
