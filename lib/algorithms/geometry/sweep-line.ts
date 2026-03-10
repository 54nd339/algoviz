import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { GeometryStep, Point, Segment } from "./types";

export const sweepLineMeta: AlgorithmMeta = {
  id: "sweep-line-intersection",
  name: "Sweep Line Intersection",
  category: "geometry",
  description:
    "Finds all intersection points among a set of line segments by sweeping a vertical line left to right, processing endpoint and intersection events.",
  timeComplexity: {
    best: "O(n log n)",
    average: "O((n+k) log n)",
    worst: "O((n+k) log n)",
  },
  spaceComplexity: "O(n+k)",
  pseudocode: `function sweepLine(segments):
  events = sorted endpoints (left, right)
  active = ordered set of segments
  for each event:
    if left endpoint:
      insert segment into active
      check neighbors for intersection
    if right endpoint:
      check neighbors of segment
      remove segment from active
    if intersection:
      swap segments, check new neighbors
  return intersections`,
  presets: [
    {
      name: "Many Intersections (6 segs)",
      generator: () => manyIntersections(),
      expectedCase: "average",
    },
    {
      name: "No Intersections (4 segs)",
      generator: () => noIntersections(),
      expectedCase: "best",
    },
    {
      name: "All Parallel (5 segs)",
      generator: () => parallelSegments(),
      expectedCase: "best",
    },
  ],
  misconceptions: [
    {
      myth: "Brute-force O(n²) is always simpler and fast enough.",
      reality:
        "Sweep line is O((n+k) log n) where k is intersections. It's faster when k << n².",
    },
  ],
  relatedAlgorithms: ["graham-scan", "voronoi-diagram"],
};

registerAlgorithm(sweepLineMeta);

function manyIntersections(): Segment[] {
  return [
    {
      p1: { x: 50, y: 100, id: "a1" },
      p2: { x: 500, y: 400, id: "a2" },
      id: "s0",
    },
    {
      p1: { x: 50, y: 400, id: "b1" },
      p2: { x: 500, y: 100, id: "b2" },
      id: "s1",
    },
    {
      p1: { x: 100, y: 50, id: "c1" },
      p2: { x: 450, y: 450, id: "c2" },
      id: "s2",
    },
    {
      p1: { x: 100, y: 450, id: "d1" },
      p2: { x: 450, y: 50, id: "d2" },
      id: "s3",
    },
    {
      p1: { x: 50, y: 250, id: "e1" },
      p2: { x: 550, y: 250, id: "e2" },
      id: "s4",
    },
    {
      p1: { x: 300, y: 50, id: "f1" },
      p2: { x: 300, y: 450, id: "f2" },
      id: "s5",
    },
  ];
}

function noIntersections(): Segment[] {
  return [
    {
      p1: { x: 50, y: 100, id: "a1" },
      p2: { x: 250, y: 100, id: "a2" },
      id: "s0",
    },
    {
      p1: { x: 50, y: 200, id: "b1" },
      p2: { x: 250, y: 200, id: "b2" },
      id: "s1",
    },
    {
      p1: { x: 300, y: 300, id: "c1" },
      p2: { x: 550, y: 300, id: "c2" },
      id: "s2",
    },
    {
      p1: { x: 300, y: 400, id: "d1" },
      p2: { x: 550, y: 400, id: "d2" },
      id: "s3",
    },
  ];
}

function parallelSegments(): Segment[] {
  return Array.from({ length: 5 }, (_, i) => ({
    p1: { x: 80 + i * 10, y: 80 + i * 70, id: `p1_${i}` },
    p2: { x: 480 + i * 10, y: 80 + i * 70, id: `p2_${i}` },
    id: `s${i}`,
  }));
}

interface Event {
  x: number;
  type: "left" | "right" | "intersection";
  segment?: Segment;
  seg1?: Segment;
  seg2?: Segment;
  point?: Point;
}

function segmentYAt(seg: Segment, x: number): number {
  const { p1, p2 } = seg;
  if (Math.abs(p2.x - p1.x) < 1e-10) return (p1.y + p2.y) / 2;
  const t = (x - p1.x) / (p2.x - p1.x);
  return p1.y + t * (p2.y - p1.y);
}

function lineIntersection(s1: Segment, s2: Segment): Point | null {
  const { p1: a, p2: b } = s1;
  const { p1: c, p2: d } = s2;

  const denom = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
  if (Math.abs(denom) < 1e-10) return null;

  const t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / denom;
  const u = -((a.x - b.x) * (a.y - c.y) - (a.y - b.y) * (a.x - c.x)) / denom;

  if (t < 0 || t > 1 || u < 0 || u > 1) return null;

  return {
    x: Math.round(a.x + t * (b.x - a.x)),
    y: Math.round(a.y + t * (b.y - a.y)),
    id: `ix_${s1.id}_${s2.id}`,
  };
}

export function* sweepLine(input: Segment[]): AlgorithmGenerator<GeometryStep> {
  const segments = input.map((s) => {
    if (s.p1.x > s.p2.x) return { ...s, p1: s.p2, p2: s.p1 };
    return { ...s };
  });

  const allPoints = segments.flatMap((s) => [s.p1, s.p2]);

  yield {
    type: "init",
    data: {
      points: allPoints,
      segments: [...segments],
      activeSegments: [],
      intersections: [],
    },
    description: `Sweep Line: ${segments.length} segments`,
    codeLine: 1,
    variables: { n: segments.length },
  };

  // Build event queue
  const events: Event[] = [];
  for (const seg of segments) {
    events.push({ x: seg.p1.x, type: "left", segment: seg });
    events.push({ x: seg.p2.x, type: "right", segment: seg });
  }
  events.sort((a, b) => a.x - b.x || (a.type === "left" ? -1 : 1));

  const active: Segment[] = [];
  const intersections: Point[] = [];
  const foundPairs = new Set<string>();

  for (const event of events) {
    const sweepX = event.x;

    if (event.type === "left" && event.segment) {
      const seg = event.segment;

      // Insert into active, maintaining y-order at sweep line
      let insertIdx = 0;
      while (
        insertIdx < active.length &&
        segmentYAt(active[insertIdx], sweepX) < segmentYAt(seg, sweepX)
      ) {
        insertIdx++;
      }
      active.splice(insertIdx, 0, seg);

      yield {
        type: "add-segment",
        data: {
          points: allPoints,
          segments: [...segments],
          activeSegments: [...active],
          intersections: [...intersections],
          sweepLineX: sweepX,
          message: `Insert ${seg.id} at sweep x=${sweepX}`,
        },
        description: `Left endpoint: activate ${seg.id}`,
        codeLine: 5,
        variables: { segment: seg.id, activeCount: active.length },
      };

      // Check neighbors
      if (insertIdx > 0) {
        checkIntersection(active[insertIdx - 1], seg);
      }
      if (insertIdx < active.length - 1) {
        checkIntersection(seg, active[insertIdx + 1]);
      }
    } else if (event.type === "right" && event.segment) {
      const seg = event.segment;
      const idx = active.findIndex((s) => s.id === seg.id);

      if (idx > 0 && idx < active.length - 1) {
        checkIntersection(active[idx - 1], active[idx + 1]);
      }

      if (idx >= 0) active.splice(idx, 1);

      yield {
        type: "event",
        data: {
          points: allPoints,
          segments: [...segments],
          activeSegments: [...active],
          intersections: [...intersections],
          sweepLineX: sweepX,
          message: `Remove ${seg.id} at sweep x=${sweepX}`,
        },
        description: `Right endpoint: deactivate ${seg.id}`,
        codeLine: 8,
        variables: { segment: seg.id, activeCount: active.length },
      };
    }
  }

  function checkIntersection(s1: Segment, s2: Segment) {
    const key = [s1.id, s2.id].sort().join("-");
    if (foundPairs.has(key)) return;

    const pt = lineIntersection(s1, s2);
    if (pt) {
      foundPairs.add(key);
      intersections.push(pt);

      // We don't yield here to avoid nested generator issues; intersections are shown on next event step
    }
  }

  yield {
    type: "done",
    data: {
      points: allPoints,
      segments: [...segments],
      intersections: [...intersections],
    },
    description: `Sweep Line complete! Found ${intersections.length} intersections`,
    variables: {
      intersectionCount: intersections.length,
    },
  };
}
