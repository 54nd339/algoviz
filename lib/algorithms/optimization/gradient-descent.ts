import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { OptimizationStep } from "./types";
import { FUNCTIONS_2D } from "./types";

export const gradientDescentMeta: AlgorithmMeta = {
  id: "gradient-descent",
  name: "Gradient Descent",
  category: "optimization",
  description:
    "Iteratively moves toward the minimum of a function by stepping in the direction opposite to the gradient. The learning rate controls step size — too large overshoots, too small converges slowly.",
  timeComplexity: { best: "O(n)", average: "O(n·i)", worst: "O(n·i)" },
  spaceComplexity: "O(d)",
  pseudocode: `function gradientDescent(f, grad, x0, lr, maxIter):
  x = x0
  for i = 1 to maxIter:
    g = grad(x)
    x = x - lr * g
    if |g| < epsilon: break
  return x`,
  presets: [
    {
      name: "Bowl (converges)",
      generator: () => ({
        functionId: "bowl",
        start: { x: 4, y: 3.5 },
        learningRate: 0.1,
        maxIterations: 50,
      }),
      expectedCase: "best",
    },
    {
      name: "Saddle Point",
      generator: () => ({
        functionId: "saddle",
        start: { x: 0.1, y: 0.1 },
        learningRate: 0.05,
        maxIterations: 50,
      }),
      expectedCase: "worst",
    },
    {
      name: "Rosenbrock Valley",
      generator: () => ({
        functionId: "rosenbrock",
        start: { x: -1.5, y: 2 },
        learningRate: 0.001,
        maxIterations: 100,
      }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Gradient descent always finds the global minimum.",
      reality:
        "It only guarantees convergence to a local minimum for convex functions. Non-convex functions can trap it in local minima.",
    },
  ],
  relatedAlgorithms: ["hill-climbing", "simulated-annealing"],
};

registerAlgorithm(gradientDescentMeta);

export function* gradientDescent(input: {
  functionId: string;
  start: { x: number; y: number };
  learningRate: number;
  maxIterations: number;
}): AlgorithmGenerator<OptimizationStep> {
  const { functionId, start, learningRate, maxIterations } = input;
  const func = FUNCTIONS_2D.find((f) => f.id === functionId) ?? FUNCTIONS_2D[0];

  let pos = { ...start };
  let value = func.fn(pos.x, pos.y);
  let best = { ...pos, value };
  const trail: { x: number; y: number }[] = [{ ...pos }];

  yield {
    type: "init",
    data: {
      position: { ...pos },
      value,
      gradient: { dx: 0, dy: 0 },
      best: { ...best },
      iteration: 0,
      trail: [...trail],
      functionId,
      phase: "init" as const,
    },
    description: `Starting at (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}), f=${value.toFixed(4)}`,
    codeLine: 2,
    variables: { x: pos.x, y: pos.y, learningRate, functionName: func.name },
  };

  for (let i = 1; i <= maxIterations; i++) {
    const grad = func.gradFn(pos.x, pos.y);

    yield {
      type: "evaluate",
      data: {
        position: { ...pos },
        value,
        gradient: { ...grad },
        best: { ...best },
        iteration: i,
        trail: [...trail],
        functionId,
        phase: "evaluate" as const,
      },
      description: `Iteration ${i}: gradient = (${grad.dx.toFixed(4)}, ${grad.dy.toFixed(4)})`,
      codeLine: 4,
      variables: {
        iteration: i,
        gradX: +grad.dx.toFixed(4),
        gradY: +grad.dy.toFixed(4),
      },
    };

    pos = {
      x: pos.x - learningRate * grad.dx,
      y: pos.y - learningRate * grad.dy,
    };
    value = func.fn(pos.x, pos.y);
    trail.push({ ...pos });

    if (value < best.value) {
      best = { ...pos, value };
    }

    yield {
      type: "move",
      data: {
        position: { ...pos },
        value,
        gradient: { ...grad },
        best: { ...best },
        iteration: i,
        trail: [...trail],
        functionId,
        phase: "move" as const,
      },
      description: `Moved to (${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}), f=${value.toFixed(4)}`,
      codeLine: 5,
      variables: {
        iteration: i,
        x: +pos.x.toFixed(4),
        y: +pos.y.toFixed(4),
        value: +value.toFixed(4),
      },
    };

    const gradMag = Math.sqrt(grad.dx ** 2 + grad.dy ** 2);
    if (gradMag < 1e-6) break;
  }

  yield {
    type: "done",
    data: {
      position: { ...pos },
      value,
      best: { ...best },
      iteration: maxIterations,
      trail: [...trail],
      functionId,
      phase: "done" as const,
    },
    description: `Optimization complete. Best: (${best.x.toFixed(3)}, ${best.y.toFixed(3)}), f=${best.value.toFixed(4)}`,
    variables: {
      bestX: +best.x.toFixed(4),
      bestY: +best.y.toFixed(4),
      bestValue: +best.value.toFixed(4),
    },
  };
}
