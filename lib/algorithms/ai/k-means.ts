import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DataPoint, KMeansStep } from "./types";

export const kMeansMeta: AlgorithmMeta = {
  id: "k-means",
  name: "K-Means Clustering",
  category: "ai",
  description:
    "Partitions n data points into k clusters by iteratively assigning points to the nearest centroid and moving centroids to the mean of their clusters until convergence.",
  timeComplexity: {
    best: "O(n·k·d)",
    average: "O(n·k·d·i)",
    worst: "O(n·k·d·i)",
  },
  spaceComplexity: "O(n·d + k·d)",
  pseudocode: `function kMeans(points, k, maxIter):
  centroids = randomInit(points, k)
  for iter = 1 to maxIter:
    // Assignment step
    for each point:
      assign to nearest centroid
    // Update step
    for each cluster:
      centroid = mean of assigned points
    if centroids unchanged:
      break  // converged`,
  presets: [
    {
      name: "3 Clear Clusters",
      generator: () => generateClusters(3, 20, 15),
      expectedCase: "best",
    },
    {
      name: "Overlapping Clusters",
      generator: () => generateClusters(3, 25, 30),
      expectedCase: "average",
    },
    {
      name: "5 Clusters",
      generator: () => generateClusters(5, 15, 15),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "K-Means always finds the optimal clustering.",
      reality:
        "K-Means converges to a local optimum. Results depend on initial centroid placement, so multiple runs with different seeds are common.",
    },
  ],
  relatedAlgorithms: ["knn", "linear-regression"],
};

registerAlgorithm(kMeansMeta);

function generateClusters(
  k: number,
  pointsPerCluster: number,
  spread: number,
): { points: DataPoint[]; k: number; maxIterations: number } {
  const points: DataPoint[] = [];
  const centers = Array.from({ length: k }, () => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
  }));
  for (const center of centers) {
    for (let i = 0; i < pointsPerCluster; i++) {
      points.push({
        x: center.x + (Math.random() - 0.5) * spread,
        y: center.y + (Math.random() - 0.5) * spread,
      });
    }
  }
  return { points, k, maxIterations: 20 };
}

function euclidean(a: DataPoint, b: DataPoint): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function* kMeans(input: {
  points: DataPoint[];
  k: number;
  maxIterations: number;
}): AlgorithmGenerator<KMeansStep> {
  const { points, k, maxIterations } = input;

  // Random initialization: pick k random points as centroids
  const shuffled = [...points].sort(() => Math.random() - 0.5);
  let centroids: DataPoint[] = shuffled
    .slice(0, k)
    .map((p) => ({ x: p.x, y: p.y }));
  const assignments = new Array(points.length).fill(0);

  yield {
    type: "init",
    data: {
      points,
      centroids: centroids.map((c) => ({ ...c })),
      assignments: [...assignments],
      iteration: 0,
      converged: false,
      phase: "init" as const,
    },
    description: `Initialized ${k} random centroids`,
    codeLine: 2,
    variables: { k, maxIterations, numPoints: points.length },
  };

  for (let iter = 1; iter <= maxIterations; iter++) {
    const previousCentroids = centroids.map((c) => ({ ...c }));

    for (let i = 0; i < points.length; i++) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let j = 0; j < centroids.length; j++) {
        const d = euclidean(points[i], centroids[j]);
        if (d < minDist) {
          minDist = d;
          minIdx = j;
        }
      }
      assignments[i] = minIdx;
    }

    yield {
      type: "assign",
      data: {
        points,
        centroids: centroids.map((c) => ({ ...c })),
        assignments: [...assignments],
        iteration: iter,
        converged: false,
        previousCentroids,
        phase: "assign" as const,
      },
      description: `Iteration ${iter}: assigned all points to nearest centroid`,
      codeLine: 5,
      variables: {
        iteration: iter,
        clusterSizes: countAssignments(assignments, k),
      },
    };

    const newCentroids: DataPoint[] = Array.from({ length: k }, () => ({
      x: 0,
      y: 0,
    }));
    const counts = new Array(k).fill(0);

    for (let i = 0; i < points.length; i++) {
      const c = assignments[i];
      newCentroids[c].x += points[i].x;
      newCentroids[c].y += points[i].y;
      counts[c]++;
    }

    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        newCentroids[j].x /= counts[j];
        newCentroids[j].y /= counts[j];
      } else {
        newCentroids[j] = { ...centroids[j] };
      }
    }

    const converged = centroids.every(
      (c, i) =>
        Math.abs(c.x - newCentroids[i].x) < 0.001 &&
        Math.abs(c.y - newCentroids[i].y) < 0.001,
    );

    centroids = newCentroids;

    yield {
      type: converged ? "converged" : "update",
      data: {
        points,
        centroids: centroids.map((c) => ({ ...c })),
        assignments: [...assignments],
        iteration: iter,
        converged,
        previousCentroids,
        phase: converged ? ("converged" as const) : ("update" as const),
      },
      description: converged
        ? `Converged at iteration ${iter}! Centroids are stable.`
        : `Iteration ${iter}: moved centroids to cluster means`,
      codeLine: converged ? 10 : 8,
      variables: {
        iteration: iter,
        converged,
        clusterSizes: countAssignments(assignments, k),
      },
    };

    if (converged) break;
  }

  yield {
    type: "done",
    data: {
      points,
      centroids: centroids.map((c) => ({ ...c })),
      assignments: [...assignments],
      iteration: maxIterations,
      converged: true,
      phase: "done" as const,
    },
    description: `Clustering complete: ${k} clusters formed`,
    variables: { k, clusterSizes: countAssignments(assignments, k) },
  };
}

function countAssignments(
  assignments: number[],
  k: number,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (let i = 0; i < k; i++) counts[`cluster${i}`] = 0;
  for (const a of assignments) counts[`cluster${a}`]++;
  return counts;
}
