import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { OptimizationStep } from "./types";
import { FUNCTIONS_1D } from "./types";

export const simulatedAnnealingMeta: AlgorithmMeta = {
  id: "simulated-annealing",
  name: "Simulated Annealing",
  category: "optimization",
  description:
    "Like hill climbing but accepts worse solutions with a probability that decreases over time (temperature). High temperature = explore freely; low temperature = exploit greedily. Can escape local optima.",
  timeComplexity: { best: "O(i)", average: "O(i)", worst: "O(i)" },
  spaceComplexity: "O(1)",
  pseudocode: `function simulatedAnnealing(f, x0, T0, cooling, maxIter):
  x = x0, best = x0, T = T0
  for i = 1 to maxIter:
    neighbor = x + random(-step, step)
    delta = f(neighbor) - f(x)
    if delta > 0:
      x = neighbor          // uphill: always accept
    else if random() < exp(delta / T):
      x = neighbor          // downhill: accept with probability
    T = T * cooling
    if f(x) > f(best): best = x
  return best`,
  presets: [
    {
      name: "Escapes Trap",
      generator: () => ({
        functionId: "multi-peak",
        start: -3,
        temperature: 10,
        coolingRate: 0.95,
        stepSize: 0.5,
        maxIterations: 100,
      }),
      expectedCase: "average",
    },
    {
      name: "Rastrigin",
      generator: () => ({
        functionId: "rastrigin-1d",
        start: 3,
        temperature: 15,
        coolingRate: 0.97,
        stepSize: 0.3,
        maxIterations: 100,
      }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Simulated annealing guarantees the global optimum.",
      reality:
        "SA provides a probabilistic guarantee with infinitely slow cooling. In practice, it finds good (often near-optimal) solutions but may not reach the absolute best.",
    },
  ],
  relatedAlgorithms: ["hill-climbing", "genetic-algorithm"],
};

registerAlgorithm(simulatedAnnealingMeta);

export function* simulatedAnnealing(input: {
  functionId: string;
  start: number;
  temperature: number;
  coolingRate: number;
  stepSize: number;
  maxIterations: number;
}): AlgorithmGenerator<OptimizationStep> {
  const {
    functionId,
    start,
    temperature: initTemp,
    coolingRate,
    stepSize,
    maxIterations,
  } = input;
  const func = FUNCTIONS_1D.find((f) => f.id === functionId) ?? FUNCTIONS_1D[0];

  let x = start;
  let value = func.fn(x);
  let temp = initTemp;
  let best = { x, y: 0, value };
  const trail: { x: number; y: number }[] = [{ x, y: 0 }];

  yield {
    type: "init",
    data: {
      position: { x, y: 0 },
      value,
      temperature: temp,
      best: { ...best },
      iteration: 0,
      trail: [...trail],
      functionId,
      phase: "init" as const,
    },
    description: `Starting SA at x=${x.toFixed(2)}, T=${temp.toFixed(1)}`,
    codeLine: 2,
    variables: { x, temperature: temp, coolingRate },
  };

  for (let i = 1; i <= maxIterations; i++) {
    const neighborX = x + (Math.random() - 0.5) * 2 * stepSize;
    const clampedX = Math.max(
      func.domain[0],
      Math.min(func.domain[1], neighborX),
    );
    const neighborVal = func.fn(clampedX);
    const delta = neighborVal - value;

    yield {
      type: "evaluate",
      data: {
        position: { x, y: 0 },
        value,
        temperature: temp,
        best: { ...best },
        iteration: i,
        trail: [...trail],
        functionId,
        phase: "evaluate" as const,
      },
      description: `Neighbor: x=${clampedX.toFixed(3)}, delta=${delta.toFixed(4)}, T=${temp.toFixed(2)}`,
      codeLine: 4,
      variables: {
        iteration: i,
        neighbor: +clampedX.toFixed(4),
        delta: +delta.toFixed(4),
        temperature: +temp.toFixed(2),
      },
    };

    const accepted =
      delta > 0 || Math.random() < Math.exp(delta / Math.max(temp, 0.001));

    if (accepted) {
      x = clampedX;
      value = neighborVal;
      trail.push({ x, y: 0 });

      if (value > best.value) {
        best = { x, y: 0, value };
      }

      yield {
        type: "accept",
        data: {
          position: { x, y: 0 },
          value,
          temperature: temp,
          best: { ...best },
          iteration: i,
          trail: [...trail],
          functionId,
          phase: "accept" as const,
        },
        description:
          delta > 0
            ? `Accepted uphill move to x=${x.toFixed(3)}`
            : `Accepted downhill move (T=${temp.toFixed(2)} allows exploration)`,
        codeLine: delta > 0 ? 6 : 8,
        variables: {
          iteration: i,
          x: +x.toFixed(4),
          value: +value.toFixed(4),
          accepted: true,
          uphill: delta > 0,
        },
      };
    } else {
      yield {
        type: "reject",
        data: {
          position: { x, y: 0 },
          value,
          temperature: temp,
          best: { ...best },
          iteration: i,
          trail: [...trail],
          functionId,
          phase: "reject" as const,
        },
        description: `Rejected move to x=${clampedX.toFixed(3)} (probability too low at T=${temp.toFixed(2)})`,
        codeLine: 8,
        variables: {
          iteration: i,
          rejected: true,
          probability: +Math.exp(delta / Math.max(temp, 0.001)).toFixed(4),
        },
      };
    }

    temp *= coolingRate;
  }

  yield {
    type: "done",
    data: {
      position: { x, y: 0 },
      value,
      temperature: temp,
      best: { ...best },
      iteration: maxIterations,
      trail: [...trail],
      functionId,
      phase: "done" as const,
    },
    description: `SA complete. Best: x=${best.x.toFixed(3)}, f(x)=${best.value.toFixed(4)}`,
    variables: {
      bestX: +best.x.toFixed(4),
      bestValue: +best.value.toFixed(4),
      finalTemp: +temp.toFixed(4),
    },
  };
}
