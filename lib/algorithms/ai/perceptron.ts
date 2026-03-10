import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DataPoint, PerceptronStep } from "./types";

export const perceptronMeta: AlgorithmMeta = {
  id: "perceptron",
  name: "Perceptron",
  category: "ai",
  description:
    "A single-layer binary classifier that updates weights for each misclassified point. The decision boundary rotates until all points are correctly classified (for linearly separable data) or the epoch limit is reached.",
  timeComplexity: { best: "O(n)", average: "O(n·e)", worst: "O(n·e)" },
  spaceComplexity: "O(d)",
  pseudocode: `function perceptron(points, lr, maxEpochs):
  weights = [0, 0], bias = 0
  for epoch = 1 to maxEpochs:
    errors = 0
    for each (x, y, class) in points:
      prediction = sign(w1*x + w2*y + bias)
      if prediction != class:
        w1 += lr * (class - prediction) * x
        w2 += lr * (class - prediction) * y
        bias += lr * (class - prediction)
        errors++
    if errors == 0: break  // converged`,
  presets: [
    {
      name: "Linearly Separable",
      generator: () => generateSeparable(30, 0.1, 20),
      expectedCase: "best",
    },
    {
      name: "XOR (Will Fail)",
      generator: () => generateXOR(0.1, 50),
      expectedCase: "worst",
    },
    {
      name: "Tight Margin",
      generator: () => generateTightMargin(30, 0.01, 30),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "The perceptron can learn any classification boundary.",
      reality:
        "The perceptron can only learn linearly separable patterns. It famously fails on XOR, which motivated multi-layer neural networks.",
    },
  ],
  relatedAlgorithms: ["neural-net", "linear-regression"],
};

registerAlgorithm(perceptronMeta);

function generateSeparable(
  n: number,
  learningRate: number,
  maxEpochs: number,
): { points: DataPoint[]; learningRate: number; maxEpochs: number } {
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const cls = y > x + 5 ? 1 : 0;
    points.push({ x, y, class: cls });
  }
  return { points, learningRate, maxEpochs };
}

function generateXOR(
  learningRate: number,
  maxEpochs: number,
): { points: DataPoint[]; learningRate: number; maxEpochs: number } {
  const points: DataPoint[] = [];
  const clusterSize = 8;
  const centers = [
    { x: 25, y: 25, cls: 0 },
    { x: 75, y: 75, cls: 0 },
    { x: 25, y: 75, cls: 1 },
    { x: 75, y: 25, cls: 1 },
  ];
  for (const c of centers) {
    for (let i = 0; i < clusterSize; i++) {
      points.push({
        x: c.x + (Math.random() - 0.5) * 20,
        y: c.y + (Math.random() - 0.5) * 20,
        class: c.cls,
      });
    }
  }
  return { points, learningRate, maxEpochs };
}

function generateTightMargin(
  n: number,
  learningRate: number,
  maxEpochs: number,
): { points: DataPoint[]; learningRate: number; maxEpochs: number } {
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const cls = y > x + 2 ? 1 : 0;
    points.push({ x, y, class: cls });
  }
  return { points, learningRate, maxEpochs };
}

function computeBoundary(w: number[]): { m: number; b: number } | null {
  // w = [w1, w2, bias]: w1*x + w2*y + bias = 0  =>  y = -(w1/w2)*x - bias/w2
  if (Math.abs(w[1]) < 1e-10) return null;
  return { m: -w[0] / w[1], b: -w[2] / w[1] };
}

export function* perceptron(input: {
  points: DataPoint[];
  learningRate: number;
  maxEpochs: number;
}): AlgorithmGenerator<PerceptronStep> {
  const { points, learningRate, maxEpochs } = input;
  // Normalize points to [-1, 1] for stable training
  const maxX = Math.max(...points.map((p) => Math.abs(p.x)), 1);
  const maxY = Math.max(...points.map((p) => Math.abs(p.y)), 1);
  const scale = Math.max(maxX, maxY);
  const normalized = points.map((p) => ({
    ...p,
    x: p.x / scale,
    y: p.y / scale,
  }));

  const w = [0, 0, 0]; // [w1, w2, bias]

  yield {
    type: "init",
    data: {
      points,
      weights: [...w],
      decisionBoundary: null,
      epoch: 0,
      totalErrors: 0,
      phase: "init" as const,
    },
    description: "Initialize weights to zero",
    codeLine: 2,
    variables: { w1: 0, w2: 0, bias: 0, learningRate },
  };

  let converged = false;

  for (let epoch = 1; epoch <= maxEpochs; epoch++) {
    let errors = 0;

    for (const np of normalized) {
      const cls = np.class ?? 0;
      const target = cls === 0 ? -1 : 1;
      const activation = w[0] * np.x + w[1] * np.y + w[2];
      const prediction = activation >= 0 ? 1 : -1;

      // Denormalize boundary for display
      const displayW = [w[0] / scale, w[1] / scale, w[2]];
      const boundary = computeBoundary(displayW);
      const originalPoint = points.find(
        (p) =>
          Math.abs(p.x / scale - np.x) < 1e-10 &&
          Math.abs(p.y / scale - np.y) < 1e-10,
      );

      if (prediction !== target) {
        w[0] += learningRate * target * np.x;
        w[1] += learningRate * target * np.y;
        w[2] += learningRate * target;
        errors++;

        const newDisplayW = [w[0] / scale, w[1] / scale, w[2]];
        const newBoundary = computeBoundary(newDisplayW);

        yield {
          type: "update",
          data: {
            points,
            weights: [...w],
            decisionBoundary: newBoundary,
            currentPoint: originalPoint,
            prediction: prediction === 1 ? 1 : 0,
            correct: false,
            epoch,
            totalErrors: errors,
            phase: "update" as const,
          },
          description: `Misclassified point — updated weights`,
          codeLine: 7,
          variables: {
            epoch,
            w1: +w[0].toFixed(4),
            w2: +w[1].toFixed(4),
            bias: +w[2].toFixed(4),
            errors,
          },
        };
      } else {
        yield {
          type: "predict",
          data: {
            points,
            weights: [...w],
            decisionBoundary: boundary,
            currentPoint: originalPoint,
            prediction: prediction === 1 ? 1 : 0,
            correct: true,
            epoch,
            totalErrors: errors,
            phase: "predict" as const,
          },
          description: `Correctly classified point`,
          codeLine: 5,
          variables: {
            epoch,
            prediction: prediction === 1 ? 1 : 0,
            correct: true,
          },
        };
      }
    }

    const displayW = [w[0] / scale, w[1] / scale, w[2]];

    yield {
      type: "epoch-end",
      data: {
        points,
        weights: [...w],
        decisionBoundary: computeBoundary(displayW),
        epoch,
        totalErrors: errors,
        phase: "epoch-end" as const,
      },
      description: `Epoch ${epoch} complete: ${errors} errors`,
      codeLine: errors === 0 ? 11 : 3,
      variables: { epoch, errors },
    };

    if (errors === 0) {
      converged = true;
      break;
    }
  }

  const displayW = [w[0] / scale, w[1] / scale, w[2]];

  yield {
    type: converged ? "done" : "failed",
    data: {
      points,
      weights: [...w],
      decisionBoundary: computeBoundary(displayW),
      epoch: maxEpochs,
      totalErrors: 0,
      phase: converged ? ("done" as const) : ("failed" as const),
    },
    description: converged
      ? "Perceptron converged — all points correctly classified!"
      : `Perceptron failed to converge after ${maxEpochs} epochs (data may not be linearly separable)`,
    variables: { converged },
    reasoning: converged
      ? undefined
      : "The perceptron convergence theorem guarantees convergence only for linearly separable data. XOR is not linearly separable.",
  };
}
