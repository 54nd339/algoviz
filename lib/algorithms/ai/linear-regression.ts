import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DataPoint, RegressionStep } from "./types";

export const linearRegressionMeta: AlgorithmMeta = {
  id: "linear-regression",
  name: "Linear Regression",
  category: "ai",
  description:
    "Fits a line y = mx + b to data by minimizing mean squared error using gradient descent. The line rotates and shifts toward the best fit over successive epochs.",
  timeComplexity: { best: "O(n·e)", average: "O(n·e)", worst: "O(n·e)" },
  spaceComplexity: "O(n)",
  pseudocode: `function linearRegression(points, lr, epochs):
  m = 0, b = 0
  for epoch = 1 to epochs:
    dm = 0, db = 0
    for each (x, y) in points:
      predicted = m * x + b
      error = predicted - y
      dm += (2/n) * error * x
      db += (2/n) * error
    m = m - lr * dm
    b = b - lr * db
    loss = MSE(points, m, b)`,
  presets: [
    {
      name: "Positive Correlation",
      generator: () => generateCorrelatedPoints(30, 2, 5, 10),
      expectedCase: "average",
    },
    {
      name: "Negative Correlation",
      generator: () => generateCorrelatedPoints(30, -1.5, 80, 12),
      expectedCase: "average",
    },
    {
      name: "Noisy Data",
      generator: () => generateCorrelatedPoints(40, 1, 10, 30),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Linear regression always finds the global optimum.",
      reality:
        "For MSE with a linear model it does (convex loss), but the learning rate must be appropriate to converge.",
    },
  ],
  relatedAlgorithms: ["perceptron", "neural-net"],
};

registerAlgorithm(linearRegressionMeta);

function generateCorrelatedPoints(
  n: number,
  slope: number,
  intercept: number,
  noise: number,
): { points: DataPoint[]; learningRate: number; epochs: number } {
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 100;
    const y = slope * x + intercept + (Math.random() - 0.5) * noise;
    points.push({ x, y });
  }
  return { points, learningRate: 0.00001, epochs: 50 };
}

function mse(points: DataPoint[], m: number, b: number): number {
  const n = points.length;
  let sum = 0;
  for (const p of points) {
    const err = m * p.x + b - p.y;
    sum += err * err;
  }
  return sum / n;
}

export function* linearRegression(input: {
  points: DataPoint[];
  learningRate: number;
  epochs: number;
}): AlgorithmGenerator<RegressionStep> {
  const { points, learningRate, epochs } = input;
  const n = points.length;
  let m = 0;
  let b = 0;
  const lossHistory: number[] = [];

  yield {
    type: "init",
    data: {
      points,
      weights: { m, b },
      loss: mse(points, m, b),
      epoch: 0,
      learningRate,
      gradients: { dm: 0, db: 0 },
      lossHistory: [],
    },
    description: "Initialize weights m=0, b=0",
    codeLine: 2,
    variables: { m, b, learningRate, epochs },
  };

  for (let epoch = 1; epoch <= epochs; epoch++) {
    let dm = 0;
    let db = 0;

    for (const p of points) {
      const predicted = m * p.x + b;
      const error = predicted - p.y;
      dm += (2 / n) * error * p.x;
      db += (2 / n) * error;
    }

    m -= learningRate * dm;
    b -= learningRate * db;
    const loss = mse(points, m, b);
    lossHistory.push(loss);

    yield {
      type: "epoch",
      data: {
        points,
        weights: { m, b },
        loss,
        epoch,
        learningRate,
        gradients: { dm, db },
        lossHistory: [...lossHistory],
      },
      description: `Epoch ${epoch}: loss=${loss.toFixed(4)}, m=${m.toFixed(4)}, b=${b.toFixed(4)}`,
      codeLine: 3,
      variables: {
        epoch,
        m: +m.toFixed(6),
        b: +b.toFixed(6),
        loss: +loss.toFixed(6),
        dm: +dm.toFixed(6),
        db: +db.toFixed(6),
      },
    };
  }

  yield {
    type: "done",
    data: {
      points,
      weights: { m, b },
      loss: mse(points, m, b),
      epoch: epochs,
      learningRate,
      gradients: { dm: 0, db: 0 },
      lossHistory: [...lossHistory],
    },
    description: `Training complete. Final: y = ${m.toFixed(4)}x + ${b.toFixed(4)}`,
    variables: {
      m: +m.toFixed(6),
      b: +b.toFixed(6),
      finalLoss: +mse(points, m, b).toFixed(6),
    },
  };
}
