export interface NumericalStep {
  x: number;
  fx: number;
  /** For numerical-integration: which function is being integrated (so plot can show correct curve). */
  functionId?: string;
  /** Custom expression string (e.g. "x^2 - 3") — used when functionId is "custom" */
  customExpression?: string;
  /** Custom domain [a, b] for the custom expression */
  customDomain?: [number, number];
  tangentLine?: { m: number; b: number };
  interval?: [number, number];
  area?: number;
  trapezoids?: { x0: number; x1: number; y0: number; y1: number }[];
  points?: { x: number; y: number; inside: boolean }[];
  piEstimate?: number;
  iteration: number;
  phase: "init" | "evaluate" | "iterate" | "converged" | "done";
}

export interface NumericFunction {
  id: string;
  name: string;
  fn: (x: number) => number;
  derivative?: (x: number) => number;
  domain: [number, number];
  root?: number;
  description: string;
}

export const NUMERIC_FUNCTIONS: NumericFunction[] = [
  {
    id: "quadratic",
    name: "x² - 2",
    fn: (x) => x * x - 2,
    derivative: (x) => 2 * x,
    domain: [-2, 3],
    root: Math.SQRT2,
    description: "Root at √2 ≈ 1.4142",
  },
  {
    id: "cubic",
    name: "x³ - x - 2",
    fn: (x) => x * x * x - x - 2,
    derivative: (x) => 3 * x * x - 1,
    domain: [-2, 3],
    root: 1.5214,
    description: "Cubic with one real root ≈ 1.5214",
  },
  {
    id: "trig",
    name: "cos(x) - x",
    fn: (x) => Math.cos(x) - x,
    derivative: (x) => -Math.sin(x) - 1,
    domain: [-2, 3],
    root: 0.7391,
    description: "Transcendental equation, root ≈ 0.7391",
  },
];

export interface IntegrationFunction {
  id: string;
  name: string;
  fn: (x: number) => number;
  domain: [number, number];
  exact: number;
  description: string;
}

export const INTEGRATION_FUNCTIONS: IntegrationFunction[] = [
  {
    id: "sin",
    name: "sin(x) on [0, π]",
    fn: (x) => Math.sin(x),
    domain: [0, Math.PI],
    exact: 2,
    description: "Exact area = 2",
  },
  {
    id: "quadratic-int",
    name: "x² on [0, 3]",
    fn: (x) => x * x,
    domain: [0, 3],
    exact: 9,
    description: "Exact area = 9",
  },
  {
    id: "gaussian",
    name: "e^(-x²) on [-2, 2]",
    fn: (x) => Math.exp(-x * x),
    domain: [-2, 2],
    exact: 1.7643, // approx erf(2)*sqrt(pi)
    description: "Gaussian bell curve, area ≈ 1.7643",
  },
];
