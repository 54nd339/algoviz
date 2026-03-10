import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GeometryStep, Point } from "./types";

export const delaunayMeta: AlgorithmMeta = {
  id: "delaunay-triangulation",
  name: "Delaunay Triangulation",
  category: "geometry",
  description:
    "Constructs a triangulation of a point set where no point lies inside the circumcircle of any triangle. Uses incremental insertion with edge flipping.",
  timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
  spaceComplexity: "O(n)",
  pseudocode: `function delaunay(points):
  create super-triangle containing all points
  for each point p:
    find triangle containing p
    split triangle into 3
    flip edges that violate Delaunay condition
  remove super-triangle edges
  return triangles`,
  presets: [
    {
      name: "Random (10 points)",
      generator: () => randomPoints(10),
      expectedCase: "average",
    },
    {
      name: "Grid (9 points)",
      generator: () => gridPoints(),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Any triangulation is a Delaunay triangulation.",
      reality:
        "Delaunay maximizes the minimum angle across all triangles, avoiding sliver triangles.",
    },
  ],
  relatedAlgorithms: ["voronoi-diagram", "graham-scan"],
};

registerAlgorithm(delaunayMeta);

function randomPoints(n: number): Point[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.round(80 + Math.random() * 440),
    y: Math.round(80 + Math.random() * 340),
    id: `p${i}`,
  }));
}

function gridPoints(): Point[] {
  const pts: Point[] = [];
  let id = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      pts.push({ x: 150 + c * 150, y: 120 + r * 140, id: `p${id++}` });
    }
  }
  return pts;
}

interface Triangle {
  a: Point;
  b: Point;
  c: Point;
}

function inCircumcircle(p: Point, t: Triangle): boolean {
  const ax = t.a.x - p.x;
  const ay = t.a.y - p.y;
  const bx = t.b.x - p.x;
  const by = t.b.y - p.y;
  const cx = t.c.x - p.x;
  const cy = t.c.y - p.y;

  const det =
    (ax * ax + ay * ay) * (bx * cy - cx * by) -
    (bx * bx + by * by) * (ax * cy - cx * ay) +
    (cx * cx + cy * cy) * (ax * by - bx * ay);

  return det > 0;
}

function triToEdges(t: Triangle): [Point, Point][] {
  return [
    [t.a, t.b],
    [t.b, t.c],
    [t.c, t.a],
  ];
}

function edgeKey(a: Point, b: Point): string {
  const ids = [a.id, b.id].sort();
  return `${ids[0]}-${ids[1]}`;
}

export function* delaunay(input: Point[]): AlgorithmGenerator<GeometryStep> {
  const points = [...input];
  const triangles: Triangle[] = [];

  yield {
    type: "init",
    data: { points: [...points] },
    description: `Delaunay Triangulation: ${points.length} points`,
    codeLine: 1,
    variables: { n: points.length },
  };

  // Super-triangle
  const st: Triangle = {
    a: { x: -500, y: -500, id: "__st0" },
    b: { x: 1500, y: -500, id: "__st1" },
    c: { x: 500, y: 1500, id: "__st2" },
  };
  triangles.push(st);

  for (let pi = 0; pi < points.length; pi++) {
    const p = points[pi];

    yield {
      type: "add-point",
      data: {
        points: [...points],
        candidatePoint: p,
        hull: trianglesToEdgePoints(triangles),
      },
      description: `Inserting point ${p.id}`,
      codeLine: 3,
      variables: { point: p.id, triangleCount: triangles.length },
    };

    // Find "bad" triangles whose circumcircle contains p
    const bad: Triangle[] = [];
    for (const t of triangles) {
      if (inCircumcircle(p, t)) {
        bad.push(t);
      }
    }

    const boundary: [Point, Point][] = [];
    for (const t of bad) {
      for (const edge of triToEdges(t)) {
        const [ea, eb] = edge;
        const shared = bad.some(
          (other) =>
            other !== t &&
            triToEdges(other).some(
              ([oa, ob]) => edgeKey(oa, ob) === edgeKey(ea, eb),
            ),
        );
        if (!shared) {
          boundary.push(edge);
        }
      }
    }

    for (const b of bad) {
      const idx = triangles.indexOf(b);
      if (idx >= 0) triangles.splice(idx, 1);
    }

    for (const [ea, eb] of boundary) {
      triangles.push({ a: ea, b: eb, c: p });
    }

    yield {
      type: "add-triangle",
      data: {
        points: [...points],
        candidatePoint: p,
        hull: trianglesToEdgePoints(triangles),
      },
      description: `Re-triangulated around ${p.id} (${triangles.length} triangles)`,
      codeLine: 5,
      variables: { triangleCount: triangles.length, badRemoved: bad.length },
    };
  }

  const superIds = new Set(["__st0", "__st1", "__st2"]);
  const finalTriangles = triangles.filter(
    (t) =>
      !superIds.has(t.a.id) && !superIds.has(t.b.id) && !superIds.has(t.c.id),
  );

  yield {
    type: "done",
    data: {
      points: [...points],
      hull: trianglesToEdgePoints(finalTriangles),
    },
    description: `Delaunay complete! ${finalTriangles.length} triangles`,
    variables: { triangleCount: finalTriangles.length },
  };
}

function trianglesToEdgePoints(triangles: Triangle[]): Point[] {
  const superIds = new Set(["__st0", "__st1", "__st2"]);
  const seen = new Set<string>();
  const hullPoints: Point[] = [];

  for (const t of triangles) {
    for (const [a, b] of triToEdges(t)) {
      if (superIds.has(a.id) || superIds.has(b.id)) continue;
      const key = edgeKey(a, b);
      if (!seen.has(key)) {
        seen.add(key);
        hullPoints.push(a, b);
      }
    }
  }
  return hullPoints;
}
