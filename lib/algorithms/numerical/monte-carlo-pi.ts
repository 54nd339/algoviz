import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { NumericalStep } from "./types";

export const monteCarloPiMeta: AlgorithmMeta = {
  id: "monte-carlo-pi",
  name: "Monte Carlo Pi",
  category: "numerical",
  description:
    "Estimates π by throwing random darts at a unit square containing a quarter circle. The ratio of darts inside the circle to total darts approximates π/4. More darts = better accuracy.",
  timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(n)",
  pseudocode: `function monteCarloPi(numSamples):
  inside = 0
  for i = 1 to numSamples:
    x = random(0, 1)
    y = random(0, 1)
    if x² + y² <= 1:
      inside++
    piEstimate = 4 * inside / i
  return piEstimate`,
  presets: [
    {
      name: "500 Darts",
      generator: () => ({ numSamples: 500, batchSize: 10 }),
      expectedCase: "average",
    },
    {
      name: "1000 Darts",
      generator: () => ({ numSamples: 1000, batchSize: 20 }),
      expectedCase: "average",
    },
    {
      name: "200 Darts (slow)",
      generator: () => ({ numSamples: 200, batchSize: 1 }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Monte Carlo methods are inherently inaccurate.",
      reality:
        "With enough samples, Monte Carlo converges to the true value. Error decreases as O(1/√n) — quadrupling samples halves the error.",
    },
  ],
  relatedAlgorithms: ["numerical-integration"],
};

registerAlgorithm(monteCarloPiMeta);

export function* monteCarloPi(input: {
  numSamples: number;
  batchSize: number;
}): AlgorithmGenerator<NumericalStep> {
  const { numSamples, batchSize } = input;
  let inside = 0;
  const allPoints: { x: number; y: number; inside: boolean }[] = [];

  yield {
    type: "init",
    data: {
      x: 0,
      fx: 0,
      points: [],
      piEstimate: 0,
      iteration: 0,
      phase: "init" as const,
    },
    description: `Throwing ${numSamples} random darts to estimate π`,
    codeLine: 2,
    variables: { numSamples, batchSize },
  };

  for (let i = 0; i < numSamples; i++) {
    const x = Math.random();
    const y = Math.random();
    const isInside = x * x + y * y <= 1;
    if (isInside) inside++;
    allPoints.push({ x, y, inside: isInside });

    // Yield every batchSize darts
    if ((i + 1) % batchSize === 0 || i === numSamples - 1) {
      const total = i + 1;
      const piEst = (4 * inside) / total;
      const error = Math.abs(piEst - Math.PI);

      yield {
        type: "evaluate",
        data: {
          x: total,
          fx: piEst,
          points: [...allPoints],
          piEstimate: piEst,
          iteration: total,
          phase: "evaluate" as const,
        },
        description: `${total} darts: ${inside} inside, π ≈ ${piEst.toFixed(6)} (error: ${error.toFixed(6)})`,
        codeLine: 7,
        variables: {
          darts: total,
          inside,
          piEstimate: +piEst.toFixed(6),
          error: +error.toFixed(6),
          accuracy: +((1 - error / Math.PI) * 100).toFixed(2),
        },
      };
    }
  }

  const finalPi = (4 * inside) / numSamples;
  yield {
    type: "done",
    data: {
      x: numSamples,
      fx: finalPi,
      points: [...allPoints],
      piEstimate: finalPi,
      iteration: numSamples,
      phase: "done" as const,
    },
    description: `Estimation complete. π ≈ ${finalPi.toFixed(6)} (actual: ${Math.PI.toFixed(6)}, error: ${Math.abs(finalPi - Math.PI).toFixed(6)})`,
    variables: {
      piEstimate: +finalPi.toFixed(8),
      piActual: +Math.PI.toFixed(8),
      error: +Math.abs(finalPi - Math.PI).toFixed(8),
      samples: numSamples,
    },
  };
}
