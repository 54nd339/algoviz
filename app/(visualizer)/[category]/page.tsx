import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CATEGORY_SLUGS } from "@/lib/categories";
import type { AlgorithmCategory } from "@/types";

import CategoryPageClient from "./page-client";

const CATEGORY_METADATA: Record<
  AlgorithmCategory,
  { title: string; description: string }
> = {
  sorting: {
    title: "Sorting Algorithms",
    description:
      "Visualize 10 sorting algorithms with step-by-step animations: Bubble, Selection, Insertion, Merge, Quick, Heap, Radix, Counting, Shell, and Tim Sort.",
  },
  searching: {
    title: "Searching Algorithms",
    description:
      "Visualize Linear, Binary, Jump, and Exponential search algorithms with animated pointer indicators and step-by-step execution.",
  },
  "data-structures": {
    title: "Data Structures",
    description:
      "Visualize 12 data structures: Stack, Queue, Linked List, BST, AVL, Red-Black Tree, Heap, Hash Table, Trie, B-Tree, Union-Find, and Huffman Coding.",
  },
  string: {
    title: "String / Pattern Matching",
    description:
      "Visualize KMP, Rabin-Karp, Boyer-Moore string matching algorithms and a Regex NFA simulator with animated state transitions.",
  },
  pathfinding: {
    title: "Grid Pathfinding",
    description:
      "Visualize BFS, DFS, Dijkstra, A*, Greedy Best-First, and Bidirectional BFS pathfinding on interactive grids with maze generators.",
  },
  graph: {
    title: "Graph Algorithms",
    description:
      "Visualize BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal MST, Prim MST, Topological Sort, and Tarjan SCC on an interactive graph editor.",
  },
  dp: {
    title: "Dynamic Programming",
    description:
      "Visualize Fibonacci, 0/1 Knapsack, LCS, Edit Distance, Coin Change, and Matrix Chain Multiplication with animated DP tables and dependency arrows.",
  },
  geometry: {
    title: "Computational Geometry",
    description:
      "Visualize Graham Scan, Jarvis March, Voronoi diagrams, Sweep Line, and Delaunay triangulation with interactive point placement.",
  },
  ai: {
    title: "AI / Machine Learning",
    description:
      "Visualize Linear Regression, KNN, K-Means clustering, Perceptron, and a simple Neural Network with interactive scatter plots and decision boundaries.",
  },
  optimization: {
    title: "Optimization Algorithms",
    description:
      "Visualize Gradient Descent, Hill Climbing, Simulated Annealing, and Genetic Algorithm optimization on contour plots.",
  },
  numerical: {
    title: "Numerical Methods",
    description:
      "Visualize Newton's Method, Bisection, Numerical Integration, and Monte Carlo Pi estimation with interactive function plots.",
  },
  games: {
    title: "Games & Puzzles",
    description:
      "Visualize Minimax with Alpha-Beta pruning, Tower of Hanoi, Sudoku Solver, Game of Life, Knight's Tour, N-Queens, and 15-Puzzle.",
  },
  fractals: {
    title: "Recursion & Fractals",
    description:
      "Explore Mandelbrot and Julia sets, Sierpinski Triangle, Koch Snowflake, and L-Systems with interactive zoom and depth controls.",
  },
  os: {
    title: "Operating Systems Algorithms",
    description:
      "Visualize CPU scheduling, page replacement, disk scheduling, and Banker's Algorithm with interactive system-state simulations.",
  },
  crypto: {
    title: "Cryptography Algorithms",
    description:
      "Visualize Diffie-Hellman key exchange, Caesar and Vigenère ciphers, and hash avalanche effects with step-by-step state transitions.",
  },
};

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

function isCategory(value: string): value is AlgorithmCategory {
  return CATEGORY_SLUGS.includes(value as AlgorithmCategory);
}

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isCategory(category)) {
    return {};
  }

  const { title, description } = CATEGORY_METADATA[category];
  return {
    title,
    description,
    openGraph: { title: `${title} | Algoviz`, description },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

export default async function VisualizerCategoryPage({
  params,
}: CategoryPageProps) {
  const { category } = await params;

  if (!isCategory(category)) {
    notFound();
  }

  return <CategoryPageClient category={category} />;
}
