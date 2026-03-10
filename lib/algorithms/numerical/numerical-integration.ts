import { parseExpression } from "@/lib/utils/math-parser";
import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { NumericalStep } from "./types";
import { INTEGRATION_FUNCTIONS } from "./types";

export const numericalIntegrationMeta: AlgorithmMeta = {
  id: "numerical-integration",
  name: "Numerical Integration",
  category: "numerical",
  description:
    "Estimates the area under a curve using the trapezoid rule. The interval is divided into segments, each approximated by a trapezoid. More segments = better accuracy.",
  timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(n)",
  pseudocode: `function trapezoidRule(f, a, b, n):
  h = (b - a) / n
  area = (f(a) + f(b)) / 2
  for i = 1 to n-1:
    area += f(a + i * h)
  area *= h
  return area`,
  presets: [
    {
      name: "sin(x), 8 segments",
      generator: () => ({
        functionId: "sin",
        segments: 8,
      }),
      expectedCase: "average",
    },
    {
      name: "x², 10 segments",
      generator: () => ({
        functionId: "quadratic-int",
        segments: 10,
      }),
      expectedCase: "average",
    },
    {
      name: "Gaussian, 12 segments",
      generator: () => ({
        functionId: "gaussian",
        segments: 12,
      }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "More segments always means dramatically better results.",
      reality:
        "Accuracy scales as O(h²) for trapezoid rule. Doubling segments cuts error by ~4x, but for smooth functions even a moderate count is quite accurate.",
    },
  ],
  relatedAlgorithms: ["monte-carlo-pi"],
};

registerAlgorithm(numericalIntegrationMeta);

export function* numericalIntegration(input: {
  functionId: string;
  segments: number;
  customExpression?: string;
  customDomain?: [number, number];
}): AlgorithmGenerator<NumericalStep> {
  const { functionId, segments, customExpression } = input;

  let f: (x: number) => number;
  let a: number, b: number;
  let funcName: string;
  let exact: number | null = null;
  const extraData: Record<string, unknown> = {};

  if (functionId === "custom" && customExpression) {
    const parsed = parseExpression(customExpression);
    if (!parsed)
      throw new Error(`Cannot parse expression: ${customExpression}`);
    f = parsed;
    [a, b] = input.customDomain ?? [0, Math.PI];
    funcName = customExpression;
    extraData.customExpression = customExpression;
    extraData.customDomain = [a, b];
  } else {
    const func =
      INTEGRATION_FUNCTIONS.find((fn) => fn.id === functionId) ??
      INTEGRATION_FUNCTIONS[0];
    f = func.fn;
    [a, b] = func.domain;
    funcName = func.name;
    exact = func.exact;
  }

  const h = (b - a) / segments;

  yield {
    type: "init",
    data: {
      x: a,
      fx: f(a),
      functionId,
      ...extraData,
      area: 0,
      trapezoids: [],
      iteration: 0,
      phase: "init" as const,
    },
    description: `Integrating ${funcName} with ${segments} trapezoids, h=${h.toFixed(4)}`,
    codeLine: 2,
    variables: {
      a,
      b,
      segments,
      h: +h.toFixed(6),
      ...(exact !== null ? { exact } : {}),
    },
  };

  let area = 0;
  const trapezoids: { x0: number; x1: number; y0: number; y1: number }[] = [];

  for (let i = 0; i < segments; i++) {
    const x0 = a + i * h;
    const x1 = a + (i + 1) * h;
    const y0 = f(x0);
    const y1 = f(x1);
    const trapArea = ((y0 + y1) / 2) * h;
    area += trapArea;
    trapezoids.push({ x0, x1, y0, y1 });

    yield {
      type: "evaluate",
      data: {
        x: x1,
        fx: y1,
        functionId,
        ...extraData,
        area,
        trapezoids: [...trapezoids],
        iteration: i + 1,
        phase: "evaluate" as const,
      },
      description: `Trapezoid ${i + 1}: [${x0.toFixed(3)}, ${x1.toFixed(3)}], area += ${trapArea.toFixed(6)}`,
      codeLine: 5,
      variables: {
        segment: i + 1,
        trapezoidArea: +trapArea.toFixed(6),
        cumulativeArea: +area.toFixed(6),
        ...(exact !== null
          ? { error: +Math.abs(area - exact).toFixed(6) }
          : {}),
      },
    };
  }

  yield {
    type: "done",
    data: {
      x: b,
      fx: f(b),
      functionId,
      ...extraData,
      area,
      trapezoids: [...trapezoids],
      iteration: segments,
      phase: "done" as const,
    },
    description:
      exact !== null
        ? `Integration complete. Estimate: ${area.toFixed(6)}, Exact: ${exact.toFixed(6)}, Error: ${Math.abs(area - exact).toFixed(6)}`
        : `Integration complete. Estimate: ${area.toFixed(6)}`,
    variables: {
      estimate: +area.toFixed(8),
      ...(exact !== null
        ? { exact, error: +Math.abs(area - exact).toFixed(8) }
        : {}),
    },
  };
}
