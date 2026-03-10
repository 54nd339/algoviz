import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { OptimizationStep } from "./types";
import { FUNCTIONS_1D } from "./types";

export const hillClimbingMeta: AlgorithmMeta = {
  id: "hill-climbing",
  name: "Hill Climbing",
  category: "optimization",
  description:
    "A greedy local search that always moves to the neighbor with the highest value. Simple but gets stuck at local optima — cannot escape peaks that aren't the global maximum.",
  timeComplexity: { best: "O(1)", average: "O(i)", worst: "O(i)" },
  spaceComplexity: "O(1)",
  pseudocode: `function hillClimbing(f, x0, stepSize, maxIter):
  x = x0
  for i = 1 to maxIter:
    left = f(x - stepSize)
    right = f(x + stepSize)
    current = f(x)
    if left > current and left >= right:
      x = x - stepSize
    else if right > current:
      x = x + stepSize
    else:
      break  // local optimum
  return x`,
  presets: [
    {
      name: "Easy Peak",
      generator: () => ({
        functionId: "single-peak",
        start: -2,
        stepSize: 0.3,
        maxIterations: 50,
      }),
      expectedCase: "best",
    },
    {
      name: "Gets Trapped",
      generator: () => ({
        functionId: "multi-peak",
        start: -3,
        stepSize: 0.2,
        maxIterations: 50,
      }),
      expectedCase: "worst",
    },
    {
      name: "Rastrigin Trap",
      generator: () => ({
        functionId: "rastrigin-1d",
        start: 3,
        stepSize: 0.1,
        maxIterations: 50,
      }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Hill climbing finds the global optimum.",
      reality:
        "Hill climbing only finds a local optimum. For global optimization, methods like simulated annealing or genetic algorithms are needed.",
    },
  ],
  relatedAlgorithms: ["simulated-annealing", "gradient-descent"],
};

registerAlgorithm(hillClimbingMeta);

export function* hillClimbing(input: {
  functionId: string;
  start: number;
  stepSize: number;
  maxIterations: number;
}): AlgorithmGenerator<OptimizationStep> {
  const { functionId, start, stepSize, maxIterations } = input;
  const func = FUNCTIONS_1D.find((f) => f.id === functionId) ?? FUNCTIONS_1D[0];

  let x = start;
  let value = func.fn(x);
  let best = { x, y: 0, value };
  const trail: { x: number; y: number }[] = [{ x, y: 0 }];

  yield {
    type: "init",
    data: {
      position: { x, y: 0 },
      value,
      best: { ...best },
      iteration: 0,
      trail: [...trail],
      functionId,
      phase: "init" as const,
    },
    description: `Starting hill climb at x=${x.toFixed(2)}, f(x)=${value.toFixed(4)}`,
    codeLine: 2,
    variables: { x, value: +value.toFixed(4), stepSize },
  };

  for (let i = 1; i <= maxIterations; i++) {
    const leftX = x - stepSize;
    const rightX = x + stepSize;
    const leftVal = func.fn(leftX);
    const rightVal = func.fn(rightX);
    const currentVal = func.fn(x);

    yield {
      type: "evaluate",
      data: {
        position: { x, y: 0 },
        value: currentVal,
        best: { ...best },
        iteration: i,
        trail: [...trail],
        functionId,
        phase: "evaluate" as const,
      },
      description: `Checking neighbors: left=${leftVal.toFixed(3)}, current=${currentVal.toFixed(3)}, right=${rightVal.toFixed(3)}`,
      codeLine: 4,
      variables: {
        iteration: i,
        left: +leftVal.toFixed(4),
        current: +currentVal.toFixed(4),
        right: +rightVal.toFixed(4),
      },
    };

    if (leftVal > currentVal && leftVal >= rightVal) {
      x = leftX;
      value = leftVal;
    } else if (rightVal > currentVal) {
      x = rightX;
      value = rightVal;
    } else {
      yield {
        type: "done",
        data: {
          position: { x, y: 0 },
          value,
          best: value >= best.value ? { x, y: 0, value } : { ...best },
          iteration: i,
          trail: [...trail],
          functionId,
          phase: "done" as const,
        },
        description: `Local optimum reached at x=${x.toFixed(3)}, f(x)=${value.toFixed(4)}`,
        codeLine: 10,
        variables: { x: +x.toFixed(4), value: +value.toFixed(4), stuck: true },
        reasoning:
          "No neighbor has a higher value — this is a local optimum. Hill climbing cannot escape.",
      };
      return;
    }

    trail.push({ x, y: 0 });
    if (value > best.value) {
      best = { x, y: 0, value };
    }

    yield {
      type: "move",
      data: {
        position: { x, y: 0 },
        value,
        best: { ...best },
        iteration: i,
        trail: [...trail],
        functionId,
        phase: "move" as const,
      },
      description: `Moved to x=${x.toFixed(3)}, f(x)=${value.toFixed(4)}`,
      codeLine: 7,
      variables: { iteration: i, x: +x.toFixed(4), value: +value.toFixed(4) },
    };
  }

  yield {
    type: "done",
    data: {
      position: { x, y: 0 },
      value,
      best: { ...best },
      iteration: maxIterations,
      trail: [...trail],
      functionId,
      phase: "done" as const,
    },
    description: `Hill climbing complete. Best: x=${best.x.toFixed(3)}, f(x)=${best.value.toFixed(4)}`,
    variables: { bestX: +best.x.toFixed(4), bestValue: +best.value.toFixed(4) },
  };
}
