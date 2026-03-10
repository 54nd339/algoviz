import type { NumericalStep } from "@/lib/algorithms/numerical";
import {
  INTEGRATION_FUNCTIONS,
  NUMERIC_FUNCTIONS,
} from "@/lib/algorithms/numerical";
import { parseExpression } from "@/lib/utils/math-parser";

export interface FunctionPlotConfig {
  id: string;
  name: string;
  fn: (x: number) => number;
  domain: [number, number];
  description: string;
}

/**
 * Evaluate a math expression string at a given x value.
 * Returns NaN if the expression cannot be parsed.
 */
export function evaluateFunction(expression: string, x: number): number {
  const parsed = parseExpression(expression);
  return parsed ? parsed(x) : NaN;
}

/**
 * Generate curve data points for a function over a domain.
 */
export function generateCurveData(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  steps: number = 300,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    points.push({ x, y: fn(x) });
  }
  return points;
}

/**
 * Resolve the function configuration from the current numerical step and algorithm.
 */
export function resolveNumericalFunction(
  step: NumericalStep | null,
  algorithmId: string,
): FunctionPlotConfig {
  const isIntegration = algorithmId === "numerical-integration";

  if (step?.functionId === "custom" && step.customExpression) {
    const parsed = parseExpression(step.customExpression);
    if (parsed) {
      const domain = (step.customDomain ?? [-5, 5]) as [number, number];
      return {
        id: "custom",
        name: step.customExpression,
        fn: parsed,
        domain,
        description: `Custom: ${step.customExpression}`,
      };
    }
  }

  if (isIntegration && step?.functionId) {
    const f =
      INTEGRATION_FUNCTIONS.find((fn) => fn.id === step.functionId) ??
      INTEGRATION_FUNCTIONS[0];
    return { ...f };
  }

  if (isIntegration) {
    return { ...INTEGRATION_FUNCTIONS[0] };
  }

  if (step?.functionId) {
    const f =
      NUMERIC_FUNCTIONS.find((fn) => fn.id === step.functionId) ??
      NUMERIC_FUNCTIONS[0];
    return { ...f };
  }

  return { ...NUMERIC_FUNCTIONS[0] };
}
