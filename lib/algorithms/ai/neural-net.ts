import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DataPoint, NeuralNetStep, NeuronLayer } from "./types";

export const neuralNetMeta: AlgorithmMeta = {
  id: "neural-net",
  name: "Neural Network",
  category: "ai",
  description:
    "A fixed 2-3-1 feedforward neural network trained with backpropagation. The hidden layer enables learning non-linear boundaries like XOR — something a single perceptron cannot do.",
  timeComplexity: { best: "O(n·e)", average: "O(n·e·h)", worst: "O(n·e·h)" },
  spaceComplexity: "O(h²)",
  pseudocode: `function neuralNet(data, lr, epochs):
  init weights randomly
  for epoch = 1 to epochs:
    totalLoss = 0
    for each (input, target) in data:
      // Forward pass
      hidden = sigmoid(W1 * input + b1)
      output = sigmoid(W2 * hidden + b2)
      loss = (target - output)²
      // Backward pass
      dOutput = 2*(output - target) * sigmoid'(output)
      dHidden = dOutput * W2^T * sigmoid'(hidden)
      // Update weights
      W2 -= lr * dOutput * hidden^T
      W1 -= lr * dHidden * input^T`,
  presets: [
    {
      name: "XOR Problem",
      generator: () => generateXOR(0.5, 100),
      expectedCase: "average",
    },
    {
      name: "Circle Decision Boundary",
      generator: () => generateCircle(0.5, 80),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Neural networks always need millions of parameters.",
      reality:
        "Even a tiny 2-3-1 network can learn non-linear boundaries like XOR. Architecture size should match problem complexity.",
    },
  ],
  relatedAlgorithms: ["perceptron", "linear-regression"],
};

registerAlgorithm(neuralNetMeta);

function generateXOR(
  learningRate: number,
  epochs: number,
): {
  data: { input: DataPoint; target: number }[];
  learningRate: number;
  epochs: number;
} {
  const data: { input: DataPoint; target: number }[] = [];
  const clusterSize = 6;
  const configs = [
    { x: 20, y: 20, target: 0 },
    { x: 80, y: 80, target: 0 },
    { x: 20, y: 80, target: 1 },
    { x: 80, y: 20, target: 1 },
  ];
  for (const c of configs) {
    for (let i = 0; i < clusterSize; i++) {
      data.push({
        input: {
          x: c.x + (Math.random() - 0.5) * 15,
          y: c.y + (Math.random() - 0.5) * 15,
          class: c.target,
        },
        target: c.target,
      });
    }
  }
  return { data, learningRate, epochs };
}

function generateCircle(
  learningRate: number,
  epochs: number,
): {
  data: { input: DataPoint; target: number }[];
  learningRate: number;
  epochs: number;
} {
  const data: { input: DataPoint; target: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dist = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2);
    const target = dist < 30 ? 1 : 0;
    data.push({ input: { x, y, class: target }, target });
  }
  return { data, learningRate, epochs };
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
}

function sigmoidDerivative(output: number): number {
  return output * (1 - output);
}

function randomWeight(): number {
  return (Math.random() - 0.5) * 2;
}

const LAYERS: NeuronLayer[] = [
  { size: 2, activation: "linear" },
  { size: 3, activation: "sigmoid" },
  { size: 1, activation: "sigmoid" },
];

export function* neuralNet(input: {
  data: { input: DataPoint; target: number }[];
  learningRate: number;
  epochs: number;
}): AlgorithmGenerator<NeuralNetStep> {
  const { data, learningRate, epochs } = input;

  // Normalize inputs to [0, 1]
  const allX = data.map((d) => d.input.x);
  const allY = data.map((d) => d.input.y);
  const minX = Math.min(...allX),
    maxX = Math.max(...allX);
  const minY = Math.min(...allY),
    maxY = Math.max(...allY);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const normalize = (p: DataPoint) => ({
    x: (p.x - minX) / rangeX,
    y: (p.y - minY) / rangeY,
  });

  // Weights: weights[l][i][j] = weight from node i in layer l to node j in layer l+1
  const weights: number[][][] = [
    // Layer 0 -> 1: 2 inputs -> 3 hidden
    Array.from({ length: 2 }, () =>
      Array.from({ length: 3 }, () => randomWeight()),
    ),
    // Layer 1 -> 2: 3 hidden -> 1 output
    Array.from({ length: 3 }, () =>
      Array.from({ length: 1 }, () => randomWeight()),
    ),
  ];
  const biases: number[][] = [
    Array.from({ length: 3 }, () => randomWeight()),
    Array.from({ length: 1 }, () => randomWeight()),
  ];

  const lossHistory: number[] = [];

  yield {
    type: "init",
    data: {
      layers: LAYERS,
      activations: [[], [], []],
      weights: weights.map((l) => l.map((r) => [...r])),
      biases: biases.map((l) => [...l]),
      loss: 0,
      epoch: 0,
      phase: "init" as const,
      lossHistory: [],
    },
    description: "Initialized 2-3-1 network with random weights",
    codeLine: 2,
    variables: { architecture: "2-3-1", learningRate, epochs },
  };

  for (let epoch = 1; epoch <= epochs; epoch++) {
    let totalLoss = 0;

    for (const sample of data) {
      const n = normalize(sample.input);
      const inp = [n.x, n.y];

      const hiddenRaw = biases[0].map((b, j) =>
        inp.reduce((sum, val, i) => sum + val * weights[0][i][j], b),
      );
      const hidden = hiddenRaw.map(sigmoid);

      const outputRaw = biases[1].map((b, j) =>
        hidden.reduce((sum, val, i) => sum + val * weights[1][i][j], b),
      );
      const output = outputRaw.map(sigmoid);

      const loss = (sample.target - output[0]) ** 2;
      totalLoss += loss;

      // Only yield detailed forward/backward every few epochs to keep step count manageable
      if (
        epoch % Math.max(1, Math.floor(epochs / 20)) === 0 &&
        data.indexOf(sample) === 0
      ) {
        yield {
          type: "forward",
          data: {
            layers: LAYERS,
            activations: [inp, hidden, output],
            weights: weights.map((l) => l.map((r) => [...r])),
            biases: biases.map((l) => [...l]),
            loss,
            epoch,
            phase: "forward" as const,
            lossHistory: [...lossHistory],
            currentInput: sample.input,
            currentTarget: sample.target,
          },
          description: `Forward pass: output=${output[0].toFixed(4)}, target=${sample.target}`,
          codeLine: 6,
          variables: {
            epoch,
            input: [+n.x.toFixed(3), +n.y.toFixed(3)],
            hidden: hidden.map((h) => +h.toFixed(3)),
            output: +output[0].toFixed(4),
          },
        };
      }

      const outputError =
        2 * (output[0] - sample.target) * sigmoidDerivative(output[0]);
      const hiddenErrors = hidden.map(
        (h, i) => outputError * weights[1][i][0] * sigmoidDerivative(h),
      );

      for (let i = 0; i < hidden.length; i++) {
        weights[1][i][0] -= learningRate * outputError * hidden[i];
      }
      biases[1][0] -= learningRate * outputError;

      for (let i = 0; i < inp.length; i++) {
        for (let j = 0; j < hidden.length; j++) {
          weights[0][i][j] -= learningRate * hiddenErrors[j] * inp[i];
        }
      }
      for (let j = 0; j < hidden.length; j++) {
        biases[0][j] -= learningRate * hiddenErrors[j];
      }
    }

    const avgLoss = totalLoss / data.length;
    lossHistory.push(avgLoss);

    if (
      epoch % Math.max(1, Math.floor(epochs / 20)) === 0 ||
      epoch === epochs
    ) {
      yield {
        type: "epoch-end",
        data: {
          layers: LAYERS,
          activations: [[], [], []],
          weights: weights.map((l) => l.map((r) => [...r])),
          biases: biases.map((l) => [...l]),
          loss: avgLoss,
          epoch,
          phase: "epoch-end" as const,
          lossHistory: [...lossHistory],
        },
        description: `Epoch ${epoch}: avg loss = ${avgLoss.toFixed(6)}`,
        codeLine: 3,
        variables: { epoch, avgLoss: +avgLoss.toFixed(6) },
      };
    }
  }

  // Final predictions for visual
  const finalActivations: number[][] = [[], [], []];
  yield {
    type: "done",
    data: {
      layers: LAYERS,
      activations: finalActivations,
      weights: weights.map((l) => l.map((r) => [...r])),
      biases: biases.map((l) => [...l]),
      loss: lossHistory[lossHistory.length - 1] ?? 0,
      epoch: epochs,
      phase: "done" as const,
      lossHistory: [...lossHistory],
    },
    description: `Training complete. Final loss: ${(lossHistory[lossHistory.length - 1] ?? 0).toFixed(6)}`,
    variables: {
      finalLoss: +(lossHistory[lossHistory.length - 1] ?? 0).toFixed(6),
      epochs,
    },
  };
}
