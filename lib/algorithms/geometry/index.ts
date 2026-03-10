export { delaunay, delaunayMeta } from "./delaunay";
export { grahamScan, grahamScanMeta } from "./graham-scan";
export { jarvisMarch, jarvisMarchMeta } from "./jarvis-march";
export { sweepLine, sweepLineMeta } from "./sweep-line";
export type { GeometryStep, Point, Segment, VoronoiEdge } from "./types";
export { voronoi, voronoiMeta } from "./voronoi";

import type { AlgorithmStep } from "@/types";

import { delaunay } from "./delaunay";
import { grahamScan } from "./graham-scan";
import { jarvisMarch } from "./jarvis-march";
import { sweepLine } from "./sweep-line";
import type { GeometryStep } from "./types";
import type { Point, Segment } from "./types";
import { voronoi } from "./voronoi";

export const GEOMETRY_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<GeometryStep>, void, undefined>
> = {
  "graham-scan": (input) => grahamScan(input as Point[]),
  "jarvis-march": (input) => jarvisMarch(input as Point[]),
  "voronoi-diagram": (input) => voronoi(input as Point[]),
  "sweep-line-intersection": (input) => sweepLine(input as Segment[]),
  "delaunay-triangulation": (input) => delaunay(input as Point[]),
};
