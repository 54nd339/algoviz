export interface Point {
  x: number;
  y: number;
  id: string;
}

export interface Segment {
  p1: Point;
  p2: Point;
  id: string;
}

export interface VoronoiEdge {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
}

export interface GeometryStep {
  points: Point[];
  hull?: Point[];
  currentEdge?: [Point, Point];
  candidatePoint?: Point;
  sweepLineX?: number;
  intersections?: Point[];
  voronoiEdges?: VoronoiEdge[];
  activeSegments?: Segment[];
  segments?: Segment[];
  stackPoints?: Point[];
  sortedPoints?: Point[];
  anchorPoint?: Point;
  message?: string;
}
