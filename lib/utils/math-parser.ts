/**
 * Parses a math expression string into a callable function of x.
 * Supports: +, -, *, /, ^, sin, cos, tan, abs, sqrt, ln, log, exp, pi, e
 * Examples: "x^2 - 2", "sin(x)", "cos(x) - x", "exp(-x^2)", "x^3 - x - 2"
 */
export function parseExpression(expr: string): ((x: number) => number) | null {
  if (!expr.trim()) return null;

  const cleaned = expr
    .replace(/\bsin\b/g, "Math.sin")
    .replace(/\bcos\b/g, "Math.cos")
    .replace(/\btan\b/g, "Math.tan")
    .replace(/\babs\b/g, "Math.abs")
    .replace(/\bsqrt\b/g, "Math.sqrt")
    .replace(/\bln\b/g, "Math.log")
    .replace(/\blog\b/g, "Math.log10")
    .replace(/\bexp\b/g, "Math.exp")
    .replace(/\bpi\b/gi, "Math.PI")
    .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, "Math.E")
    .replace(/\^/g, "**");

  try {
    const fn = new Function("x", `"use strict"; return (${cleaned});`) as (
      x: number,
    ) => number;
    const test0 = fn(0);
    const test1 = fn(1);
    if (typeof test0 !== "number" || typeof test1 !== "number") return null;
    return fn;
  } catch {
    return null;
  }
}

/** Computes numerical derivative using central differences */
export function numericalDerivative(
  fn: (x: number) => number,
): (x: number) => number {
  const h = 1e-8;
  return (x: number) => (fn(x + h) - fn(x - h)) / (2 * h);
}
