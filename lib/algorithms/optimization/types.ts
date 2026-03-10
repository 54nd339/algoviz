export interface OptimizationStep {
  position: { x: number; y: number };
  value: number;
  gradient?: { dx: number; dy: number };
  temperature?: number;
  population?: { x: number; y: number; fitness: number }[];
  best: { x: number; y: number; value: number };
  iteration: number;
  trail: { x: number; y: number }[];
  functionId: string;
  phase:
    | "init"
    | "evaluate"
    | "move"
    | "accept"
    | "reject"
    | "select"
    | "crossover"
    | "mutate"
    | "done";
}

export interface OptFunction1D {
  id: string;
  name: string;
  fn: (x: number) => number;
  domain: [number, number];
  description: string;
}

export interface OptFunction2D {
  id: string;
  name: string;
  fn: (x: number, y: number) => number;
  gradFn: (x: number, y: number) => { dx: number; dy: number };
  domain: { x: [number, number]; y: [number, number] };
  description: string;
}

export const FUNCTIONS_1D: OptFunction1D[] = [
  {
    id: "multi-peak",
    name: "Multi-Peak",
    fn: (x) => Math.sin(x) * x + Math.cos(2 * x) * 3,
    domain: [-5, 10],
    description: "Multiple local maxima — hill climbing gets trapped",
  },
  {
    id: "single-peak",
    name: "Single Peak",
    fn: (x) => -(x - 3) * (x - 3) + 20,
    domain: [-5, 11],
    description: "Single global maximum — easy for all methods",
  },
  {
    id: "rastrigin-1d",
    name: "Rastrigin 1D",
    fn: (x) => -(x * x - 10 * Math.cos(2 * Math.PI * x) + 10),
    domain: [-5.12, 5.12],
    description: "Many local optima — challenging for greedy methods",
  },
];

export function is1DStart(input: unknown): input is { start: number } {
  return (
    typeof input === "object" &&
    input !== null &&
    "start" in input &&
    typeof (input as { start: unknown }).start === "number"
  );
}

export function is2DStart(
  input: unknown,
): input is { start: { x: number; y: number } } {
  const o = input as Record<string, unknown>;
  return (
    typeof o?.start === "object" &&
    o.start !== null &&
    typeof (o.start as { x: unknown }).x === "number" &&
    typeof (o.start as { y: unknown }).y === "number"
  );
}

export const FUNCTIONS_2D: OptFunction2D[] = [
  {
    id: "bowl",
    name: "Bowl (Quadratic)",
    fn: (x, y) => x * x + y * y,
    gradFn: (x, y) => ({ dx: 2 * x, dy: 2 * y }),
    domain: { x: [-5, 5], y: [-5, 5] },
    description: "Simple convex bowl — gradient descent converges reliably",
  },
  {
    id: "saddle",
    name: "Saddle Point",
    fn: (x, y) => x * x - y * y,
    gradFn: (x, y) => ({ dx: 2 * x, dy: -2 * y }),
    domain: { x: [-5, 5], y: [-5, 5] },
    description: "Saddle point at origin — gradient descent may stall",
  },
  {
    id: "rosenbrock",
    name: "Rosenbrock",
    fn: (x, y) => (1 - x) ** 2 + 100 * (y - x * x) ** 2,
    gradFn: (x, y) => ({
      dx: -2 * (1 - x) + 200 * (y - x * x) * (-2 * x),
      dy: 200 * (y - x * x),
    }),
    domain: { x: [-2, 2], y: [-1, 3] },
    description: "Narrow curved valley — hard for fixed learning rates",
  },
];
