import { parseExpression } from "@/lib/utils/math-parser";
import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { NumericalStep } from "./types";
import { NUMERIC_FUNCTIONS } from "./types";

export const bisectionMeta: AlgorithmMeta = {
  id: "bisection",
  name: "Bisection Method",
  category: "numerical",
  description:
    "Root-finding by repeatedly halving an interval [a,b] where f(a) and f(b) have opposite signs. The midpoint is checked and the interval is narrowed. Guaranteed to converge (unlike Newton's).",
  timeComplexity: {
    best: "O(log(1/ε))",
    average: "O(log(1/ε))",
    worst: "O(log(1/ε))",
  },
  spaceComplexity: "O(1)",
  pseudocode: `function bisection(f, a, b, tol, maxIter):
  // Requires f(a) * f(b) < 0
  for i = 1 to maxIter:
    mid = (a + b) / 2
    fMid = f(mid)
    if |fMid| < tol: return mid
    if f(a) * fMid < 0:
      b = mid
    else:
      a = mid
  return (a + b) / 2`,
  presets: [
    {
      name: "√2 (x² - 2)",
      generator: () => ({
        functionId: "quadratic",
        a: 0,
        b: 3,
        tolerance: 1e-8,
        maxIterations: 30,
      }),
      expectedCase: "average",
    },
    {
      name: "Cubic Root",
      generator: () => ({
        functionId: "cubic",
        a: 1,
        b: 2,
        tolerance: 1e-8,
        maxIterations: 30,
      }),
      expectedCase: "average",
    },
    {
      name: "cos(x) = x",
      generator: () => ({
        functionId: "trig",
        a: 0,
        b: 2,
        tolerance: 1e-8,
        maxIterations: 30,
      }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Bisection is too slow to be useful.",
      reality:
        "While slower than Newton's method, bisection is robust and guaranteed to converge — making it reliable as a fallback or for non-differentiable functions.",
    },
  ],
  relatedAlgorithms: ["newton-method"],
};

registerAlgorithm(bisectionMeta);

export function* bisection(input: {
  functionId: string;
  a: number;
  b: number;
  tolerance: number;
  maxIterations: number;
  customExpression?: string;
}): AlgorithmGenerator<NumericalStep> {
  const { functionId, tolerance, maxIterations, customExpression } = input;
  let { a, b } = input;

  let f: (x: number) => number;
  if (functionId === "custom" && customExpression) {
    const parsed = parseExpression(customExpression);
    if (!parsed)
      throw new Error(`Cannot parse expression: ${customExpression}`);
    f = parsed;
  } else {
    const func =
      NUMERIC_FUNCTIONS.find((fn) => fn.id === functionId) ??
      NUMERIC_FUNCTIONS[0];
    f = func.fn;
  }
  const extraData =
    functionId === "custom"
      ? { customExpression, customDomain: [a - 1, b + 1] as [number, number] }
      : {};

  let fa = f(a);
  let fb = f(b);

  yield {
    type: "init",
    data: {
      x: (a + b) / 2,
      fx: f((a + b) / 2),
      functionId,
      ...extraData,
      interval: [a, b] as [number, number],
      iteration: 0,
      phase: "init" as const,
    },
    description: `Bisection on [${a.toFixed(2)}, ${b.toFixed(2)}], f(a)=${fa.toFixed(4)}, f(b)=${fb.toFixed(4)}`,
    codeLine: 2,
    variables: { a, b, fa: +fa.toFixed(6), fb: +fb.toFixed(6) },
  };

  if (fa * fb > 0) {
    yield {
      type: "done",
      data: {
        x: (a + b) / 2,
        fx: f((a + b) / 2),
        functionId,
        ...extraData,
        interval: [a, b] as [number, number],
        iteration: 0,
        phase: "done" as const,
      },
      description: "Error: f(a) and f(b) must have opposite signs",
      variables: { error: "same sign" },
      reasoning:
        "The bisection method requires a sign change in the interval to guarantee a root exists.",
    };
    return;
  }

  for (let i = 1; i <= maxIterations; i++) {
    const mid = (a + b) / 2;
    const fMid = f(mid);

    yield {
      type: "evaluate",
      data: {
        x: mid,
        fx: fMid,
        functionId,
        ...extraData,
        interval: [a, b] as [number, number],
        iteration: i,
        phase: "evaluate" as const,
      },
      description: `Iteration ${i}: midpoint=${mid.toFixed(8)}, f(mid)=${fMid.toFixed(8)}`,
      codeLine: 4,
      variables: {
        iteration: i,
        a: +a.toFixed(8),
        b: +b.toFixed(8),
        mid: +mid.toFixed(8),
        fMid: +fMid.toFixed(8),
      },
    };

    if (Math.abs(fMid) < tolerance || (b - a) / 2 < tolerance) {
      yield {
        type: "done",
        data: {
          x: mid,
          fx: fMid,
          functionId,
          ...extraData,
          interval: [a, b] as [number, number],
          iteration: i,
          phase: "converged" as const,
        },
        description: `Converged! Root ≈ ${mid.toFixed(10)} after ${i} iterations`,
        codeLine: 6,
        variables: {
          root: +mid.toFixed(10),
          iterations: i,
          intervalWidth: +(b - a).toFixed(12),
        },
      };
      return;
    }

    if (fa * fMid < 0) {
      b = mid;
      fb = fMid;
    } else {
      a = mid;
      fa = fMid;
    }

    yield {
      type: "iterate",
      data: {
        x: mid,
        fx: fMid,
        functionId,
        ...extraData,
        interval: [a, b] as [number, number],
        iteration: i,
        phase: "iterate" as const,
      },
      description: `Narrowed to [${a.toFixed(6)}, ${b.toFixed(6)}] (width: ${(b - a).toFixed(8)})`,
      codeLine: fa * fMid < 0 ? 8 : 10,
      variables: {
        iteration: i,
        a: +a.toFixed(8),
        b: +b.toFixed(8),
        width: +(b - a).toFixed(8),
      },
    };
  }

  const mid = (a + b) / 2;
  yield {
    type: "done",
    data: {
      x: mid,
      fx: f(mid),
      functionId,
      ...extraData,
      interval: [a, b] as [number, number],
      iteration: maxIterations,
      phase: "done" as const,
    },
    description: `Max iterations reached. Best estimate: x = ${mid.toFixed(8)}`,
    variables: { root: +mid.toFixed(8), intervalWidth: +(b - a).toFixed(8) },
  };
}
