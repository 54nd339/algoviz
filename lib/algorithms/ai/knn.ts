import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DataPoint, KNNStep } from "./types";

export const knnMeta: AlgorithmMeta = {
  id: "knn",
  name: "K-Nearest Neighbors",
  category: "ai",
  description:
    "Classifies a query point by finding the K nearest training points and taking a majority vote of their classes. A lazy, instance-based learning algorithm.",
  timeComplexity: { best: "O(n)", average: "O(n·d)", worst: "O(n·d)" },
  spaceComplexity: "O(n)",
  pseudocode: `function knn(points, query, k):
  distances = []
  for each point in points:
    d = euclideanDistance(point, query)
    distances.append((point, d))
  sort distances by d ascending
  neighbors = distances[:k]
  prediction = majorityVote(neighbors)
  return prediction`,
  presets: [
    {
      name: "Linearly Separable",
      generator: () => generateSeparableKNN(30, 3),
      expectedCase: "best",
    },
    {
      name: "Overlapping Classes",
      generator: () => generateOverlappingKNN(40, 5),
      expectedCase: "average",
    },
    {
      name: "Three Classes",
      generator: () => generateThreeClassKNN(45, 5),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "KNN learns a model during training.",
      reality:
        "KNN is a lazy learner — it stores all training data and defers computation until prediction time.",
    },
  ],
  relatedAlgorithms: ["k-means", "perceptron"],
};

registerAlgorithm(knnMeta);

function generateSeparableKNN(
  n: number,
  k: number,
): { points: DataPoint[]; queryPoint: DataPoint; k: number } {
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const cls = i < n / 2 ? 0 : 1;
    const cx = cls === 0 ? 25 : 75;
    const cy = cls === 0 ? 25 : 75;
    points.push({
      x: cx + (Math.random() - 0.5) * 30,
      y: cy + (Math.random() - 0.5) * 30,
      class: cls,
    });
  }
  return { points, queryPoint: { x: 50, y: 50 }, k };
}

function generateOverlappingKNN(
  n: number,
  k: number,
): { points: DataPoint[]; queryPoint: DataPoint; k: number } {
  const points: DataPoint[] = [];
  for (let i = 0; i < n; i++) {
    const cls = i < n / 2 ? 0 : 1;
    const cx = cls === 0 ? 40 : 60;
    const cy = cls === 0 ? 40 : 60;
    points.push({
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 40,
      class: cls,
    });
  }
  return { points, queryPoint: { x: 50, y: 50 }, k };
}

function generateThreeClassKNN(
  n: number,
  k: number,
): { points: DataPoint[]; queryPoint: DataPoint; k: number } {
  const points: DataPoint[] = [];
  const centers = [
    { x: 30, y: 70 },
    { x: 70, y: 70 },
    { x: 50, y: 25 },
  ];
  for (let i = 0; i < n; i++) {
    const cls = i % 3;
    const c = centers[cls];
    points.push({
      x: c.x + (Math.random() - 0.5) * 30,
      y: c.y + (Math.random() - 0.5) * 30,
      class: cls,
    });
  }
  return { points, queryPoint: { x: 50, y: 55 }, k };
}

function euclidean(a: DataPoint, b: DataPoint): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function* knn(input: {
  points: DataPoint[];
  queryPoint: DataPoint;
  k: number;
}): AlgorithmGenerator<KNNStep> {
  const { points, queryPoint, k } = input;

  yield {
    type: "init",
    data: {
      points,
      queryPoint,
      k,
      distances: [],
      neighbors: [],
      prediction: -1,
      phase: "init" as const,
    },
    description: `Classify query point (${queryPoint.x.toFixed(1)}, ${queryPoint.y.toFixed(1)}) using K=${k}`,
    codeLine: 1,
    variables: {
      k,
      queryX: +queryPoint.x.toFixed(2),
      queryY: +queryPoint.y.toFixed(2),
    },
  };

  const distances: { point: DataPoint; distance: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const d = euclidean(points[i], queryPoint);
    distances.push({ point: points[i], distance: d });

    if (i % 5 === 4 || i === points.length - 1) {
      yield {
        type: "compute-distances",
        data: {
          points,
          queryPoint,
          k,
          distances: [...distances],
          neighbors: [],
          prediction: -1,
          phase: "compute-distances" as const,
        },
        description: `Computed distances for points ${Math.max(0, i - 4)}–${i} (${distances.length}/${points.length} done)`,
        codeLine: 4,
        variables: {
          pointIndex: i,
          distance: +d.toFixed(2),
          computed: distances.length,
        },
      };
    }
  }

  distances.sort((a, b) => a.distance - b.distance);
  const neighbors = distances.slice(0, k).map((d) => d.point);

  yield {
    type: "select-neighbors",
    data: {
      points,
      queryPoint,
      k,
      distances: [...distances],
      neighbors: [...neighbors],
      prediction: -1,
      phase: "select-neighbors" as const,
    },
    description: `Selected ${k} nearest neighbors (distances: ${distances
      .slice(0, k)
      .map((d) => d.distance.toFixed(1))
      .join(", ")})`,
    codeLine: 6,
    variables: {
      k,
      nearestDistances: distances
        .slice(0, k)
        .map((d) => +d.distance.toFixed(2)),
    },
  };

  const classCounts = new Map<number, number>();
  for (const n of neighbors) {
    const cls = n.class ?? 0;
    classCounts.set(cls, (classCounts.get(cls) ?? 0) + 1);
  }
  let prediction = 0;
  let maxCount = 0;
  for (const [cls, count] of classCounts) {
    if (count > maxCount) {
      maxCount = count;
      prediction = cls;
    }
  }

  yield {
    type: "predict",
    data: {
      points,
      queryPoint,
      k,
      distances: [...distances],
      neighbors: [...neighbors],
      prediction,
      phase: "predict" as const,
    },
    description: `Majority vote: class ${prediction} (${maxCount}/${k} neighbors)`,
    codeLine: 7,
    variables: { prediction, votes: Object.fromEntries(classCounts) },
  };

  yield {
    type: "done",
    data: {
      points,
      queryPoint,
      k,
      distances: [...distances],
      neighbors: [...neighbors],
      prediction,
      phase: "done" as const,
    },
    description: `Classification complete: query point assigned to class ${prediction}`,
    variables: { prediction, k },
  };
}
