import { numericalDerivative, parseExpression } from "@/lib/utils/math-parser";
import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { NumericalStep } from "./types";
import { NUMERIC_FUNCTIONS } from "./types";

export const newtonMethodMeta: AlgorithmMeta = {
  id: "newton-method",
  name: "Newton's Method",
  category: "numerical",
  description:
    "Root-finding by repeatedly computing the tangent line at the current guess and jumping to its x-intercept. Converges quadratically for well-behaved functions near the root.",
  timeComplexity: { best: "O(1)", average: "O(log log(1/ε))", worst: "O(n)" },
  spaceComplexity: "O(1)",
  pseudocode: `function newtonMethod(f, f', x0, tol, maxIter):
  x = x0
  for i = 1 to maxIter:
    fx = f(x)
    fpx = f'(x)
    if |fpx| < epsilon: break // zero derivative
    x_new = x - fx / fpx
    if |x_new - x| < tol: return x_new
    x = x_new
  return x`,
  presets: [
    {
      name: "√2 (x² - 2)",
      generator: () => ({
        functionId: "quadratic",
        initialGuess: 2.5,
        tolerance: 1e-10,
        maxIterations: 20,
      }),
      expectedCase: "best",
    },
    {
      name: "Cubic Root",
      generator: () => ({
        functionId: "cubic",
        initialGuess: 2,
        tolerance: 1e-10,
        maxIterations: 20,
      }),
      expectedCase: "average",
    },
    {
      name: "cos(x) = x",
      generator: () => ({
        functionId: "trig",
        initialGuess: 2,
        tolerance: 1e-10,
        maxIterations: 20,
      }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Newton's method always converges.",
      reality:
        "It can diverge if the initial guess is far from the root, or oscillate near inflection points where the derivative is near zero.",
    },
  ],
  relatedAlgorithms: ["bisection"],
};

registerAlgorithm(newtonMethodMeta);

export function* newtonMethod(input: {
  functionId: string;
  initialGuess: number;
  tolerance: number;
  maxIterations: number;
  customExpression?: string;
  customDomain?: [number, number];
}): AlgorithmGenerator<NumericalStep> {
  const {
    functionId,
    initialGuess,
    tolerance,
    maxIterations,
    customExpression,
  } = input;

  let f: (x: number) => number;
  let fp: (x: number) => number;
  let funcName: string;
  const extraData: Record<string, unknown> = {};

  if (functionId === "custom" && customExpression) {
    const parsed = parseExpression(customExpression);
    if (!parsed)
      throw new Error(`Cannot parse expression: ${customExpression}`);
    f = parsed;
    fp = numericalDerivative(f);
    funcName = customExpression;
    extraData.customExpression = customExpression;
    extraData.customDomain = input.customDomain ?? [
      initialGuess - 5,
      initialGuess + 5,
    ];
  } else {
    const func =
      NUMERIC_FUNCTIONS.find((fn) => fn.id === functionId) ??
      NUMERIC_FUNCTIONS[0];
    f = func.fn;
    fp = func.derivative!;
    funcName = func.name;
  }

  let x = initialGuess;
  let fx = f(x);

  yield {
    type: "init",
    data: {
      x,
      fx,
      functionId,
      ...extraData,
      iteration: 0,
      phase: "init" as const,
    },
    description: `Starting Newton's method at x₀ = ${x.toFixed(4)}, f(x₀) = ${fx.toFixed(6)}`,
    codeLine: 2,
    variables: { x, fx: +fx.toFixed(8), tolerance, functionName: funcName },
  };

  for (let i = 1; i <= maxIterations; i++) {
    const fpx = fp(x);

    // Tangent line: y - fx = fpx * (t - x)  =>  y = fpx * t + (fx - fpx * x)
    const tangentLine = { m: fpx, b: fx - fpx * x };

    yield {
      type: "evaluate",
      data: {
        x,
        fx,
        functionId,
        ...extraData,
        tangentLine,
        iteration: i,
        phase: "evaluate" as const,
      },
      description: `Iteration ${i}: tangent at x=${x.toFixed(6)}, slope=${fpx.toFixed(4)}`,
      codeLine: 5,
      variables: {
        iteration: i,
        x: +x.toFixed(8),
        fx: +fx.toFixed(8),
        fpx: +fpx.toFixed(8),
      },
    };

    if (Math.abs(fpx) < 1e-12) {
      yield {
        type: "done",
        data: {
          x,
          fx,
          functionId,
          ...extraData,
          tangentLine,
          iteration: i,
          phase: "done" as const,
        },
        description: `Derivative near zero — method may diverge. Stopping.`,
        variables: { x: +x.toFixed(8), converged: false },
        reasoning:
          "Newton's method fails when the derivative is zero (horizontal tangent has no x-intercept).",
      };
      return;
    }

    const xNew = x - fx / fpx;
    const fxNew = f(xNew);

    yield {
      type: "iterate",
      data: {
        x: xNew,
        fx: fxNew,
        functionId,
        ...extraData,
        tangentLine,
        iteration: i,
        phase: "iterate" as const,
      },
      description: `x₁ = ${x.toFixed(6)} - ${fx.toFixed(6)}/${fpx.toFixed(4)} = ${xNew.toFixed(8)}`,
      codeLine: 7,
      variables: {
        iteration: i,
        xOld: +x.toFixed(8),
        xNew: +xNew.toFixed(8),
        fxNew: +fxNew.toFixed(8),
      },
    };

    if (Math.abs(xNew - x) < tolerance) {
      yield {
        type: "done",
        data: {
          x: xNew,
          fx: fxNew,
          functionId,
          ...extraData,
          iteration: i,
          phase: "converged" as const,
        },
        description: `Converged! Root ≈ ${xNew.toFixed(10)} after ${i} iterations`,
        codeLine: 8,
        variables: {
          root: +xNew.toFixed(10),
          iterations: i,
          error: +Math.abs(fxNew).toFixed(12),
        },
      };
      return;
    }

    x = xNew;
    fx = fxNew;
  }

  yield {
    type: "done",
    data: {
      x,
      fx,
      functionId,
      ...extraData,
      iteration: maxIterations,
      phase: "done" as const,
    },
    description: `Max iterations reached. Best estimate: x = ${x.toFixed(8)}`,
    variables: { x: +x.toFixed(8), fx: +fx.toFixed(8) },
  };
}
