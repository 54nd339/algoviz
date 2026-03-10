import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { FractalShape, RecursiveFractalStep } from "./types";

export const sierpinskiMeta: AlgorithmMeta = {
  id: "sierpinski",
  name: "Sierpinski Triangle",
  category: "fractals",
  description:
    "A fractal formed by recursively removing the central triangle from an equilateral triangle. Each step triples the number of triangles while halving their size, creating a self-similar pattern with Hausdorff dimension log(3)/log(2) ≈ 1.585.",
  timeComplexity: { best: "O(3ⁿ)", average: "O(3ⁿ)", worst: "O(3ⁿ)" },
  spaceComplexity: "O(3ⁿ)",
  pseudocode: `function sierpinski(triangle, depth):
  if depth == 0:
    draw(triangle)
    return
  mid01 = midpoint(v0, v1)
  mid12 = midpoint(v1, v2)
  mid02 = midpoint(v0, v2)
  sierpinski([v0, mid01, mid02], depth - 1)
  sierpinski([mid01, v1, mid12], depth - 1)
  sierpinski([mid02, mid12, v2], depth - 1)`,
  presets: [
    {
      name: "Depth 5",
      generator: () => ({ maxDepth: 5 }),
      expectedCase: "average",
    },
    {
      name: "Depth 7",
      generator: () => ({ maxDepth: 7 }),
      expectedCase: "worst",
    },
    {
      name: "Depth 3",
      generator: () => ({ maxDepth: 3 }),
      expectedCase: "best",
    },
  ],
};

registerAlgorithm(sierpinskiMeta);

interface Point {
  x: number;
  y: number;
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function subdivide(
  v0: Point,
  v1: Point,
  v2: Point,
  depth: number,
  maxDepth: number,
  shapes: FractalShape[],
): void {
  if (depth >= maxDepth) {
    shapes.push({ type: "triangle", points: [v0, v1, v2], depth });
    return;
  }
  const m01 = midpoint(v0, v1);
  const m12 = midpoint(v1, v2);
  const m02 = midpoint(v0, v2);
  subdivide(v0, m01, m02, depth + 1, maxDepth, shapes);
  subdivide(m01, v1, m12, depth + 1, maxDepth, shapes);
  subdivide(m02, m12, v2, depth + 1, maxDepth, shapes);
}

export function* sierpinski(input: {
  maxDepth: number;
}): AlgorithmGenerator<RecursiveFractalStep> {
  const { maxDepth } = input;
  const size = 500;
  const h = (size * Math.sqrt(3)) / 2;
  const v0: Point = { x: size / 2, y: 0 };
  const v1: Point = { x: 0, y: h };
  const v2: Point = { x: size, y: h };

  yield {
    type: "init",
    data: {
      shapes: [{ type: "triangle", points: [v0, v1, v2], depth: 0 }],
      depth: 0,
      maxDepth,
      fractalType: "sierpinski",
    },
    description: "Starting with equilateral triangle",
    codeLine: 1,
    variables: { depth: 0, maxDepth, triangles: 1 },
  };

  for (let d = 1; d <= maxDepth; d++) {
    const shapes: FractalShape[] = [];
    subdivide(v0, v1, v2, 0, d, shapes);

    yield {
      type: "recurse",
      data: { shapes, depth: d, maxDepth, fractalType: "sierpinski" },
      description: `Depth ${d}: ${shapes.length} triangles`,
      codeLine: d <= 1 ? 5 : 7,
      variables: { depth: d, triangles: shapes.length },
      callStack: [{ name: "sierpinski", args: { depth: d, maxDepth } }],
    };
  }

  const finalShapes: FractalShape[] = [];
  subdivide(v0, v1, v2, 0, maxDepth, finalShapes);

  yield {
    type: "done",
    data: {
      shapes: finalShapes,
      depth: maxDepth,
      maxDepth,
      fractalType: "sierpinski",
    },
    description: `Sierpinski triangle complete: ${finalShapes.length} triangles at depth ${maxDepth}`,
    codeLine: 10,
    variables: { totalTriangles: finalShapes.length },
  };
}
