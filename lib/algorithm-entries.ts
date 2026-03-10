import type { AlgorithmCategory } from "@/types";

export interface AlgorithmEntry {
  name: string;
  category: AlgorithmCategory;
  slug: string;
  complexity: string;
  /** When set, navigation will include ?algo=id so the category page can pre-select this algorithm. */
  algorithmId?: string;
}

export const ALGORITHM_ENTRIES: AlgorithmEntry[] = [
  // Sorting
  { name: "Bubble Sort", category: "sorting", slug: "/sorting", complexity: "O(n²)", algorithmId: "bubble-sort" },
  { name: "Selection Sort", category: "sorting", slug: "/sorting", complexity: "O(n²)", algorithmId: "selection-sort" },
  { name: "Insertion Sort", category: "sorting", slug: "/sorting", complexity: "O(n²)", algorithmId: "insertion-sort" },
  { name: "Merge Sort", category: "sorting", slug: "/sorting", complexity: "O(n log n)", algorithmId: "merge-sort" },
  { name: "Quick Sort", category: "sorting", slug: "/sorting", complexity: "O(n log n)", algorithmId: "quick-sort" },
  { name: "Heap Sort", category: "sorting", slug: "/sorting", complexity: "O(n log n)", algorithmId: "heap-sort" },
  { name: "Radix Sort", category: "sorting", slug: "/sorting", complexity: "O(nk)", algorithmId: "radix-sort" },
  { name: "Counting Sort", category: "sorting", slug: "/sorting", complexity: "O(n+k)", algorithmId: "counting-sort" },
  { name: "Shell Sort", category: "sorting", slug: "/sorting", complexity: "O(n^(4/3))", algorithmId: "shell-sort" },
  { name: "Tim Sort", category: "sorting", slug: "/sorting", complexity: "O(n log n)", algorithmId: "tim-sort" },
  // Searching
  { name: "Linear Search", category: "searching", slug: "/searching", complexity: "O(n)", algorithmId: "linear-search" },
  { name: "Binary Search", category: "searching", slug: "/searching", complexity: "O(log n)", algorithmId: "binary-search" },
  // Pathfinding
  { name: "BFS", category: "pathfinding", slug: "/pathfinding", complexity: "O(V+E)", algorithmId: "pathfinding-bfs" },
  { name: "DFS", category: "pathfinding", slug: "/pathfinding", complexity: "O(V+E)", algorithmId: "pathfinding-dfs" },
  { name: "Dijkstra", category: "pathfinding", slug: "/pathfinding", complexity: "O(V²)", algorithmId: "pathfinding-dijkstra" },
  { name: "A* Search", category: "pathfinding", slug: "/pathfinding", complexity: "O(b^d)", algorithmId: "pathfinding-a-star" },
  // Data Structures
  { name: "BST", category: "data-structures", slug: "/data-structures", complexity: "O(log n)", algorithmId: "bst" },
  { name: "AVL Tree", category: "data-structures", slug: "/data-structures", complexity: "O(log n)", algorithmId: "avl" },
  { name: "Hash Table", category: "data-structures", slug: "/data-structures", complexity: "O(1)", algorithmId: "hash-table" },
  // String
  { name: "KMP", category: "string", slug: "/string", complexity: "O(n+m)", algorithmId: "kmp" },
  // Graph
  { name: "Graph BFS", category: "graph", slug: "/graph", complexity: "O(V+E)", algorithmId: "graph-bfs" },
  { name: "Graph DFS", category: "graph", slug: "/graph", complexity: "O(V+E)", algorithmId: "graph-dfs" },
  { name: "Dijkstra (Graph)", category: "graph", slug: "/graph", complexity: "O((V+E) log V)", algorithmId: "graph-dijkstra" },
  { name: "Bellman-Ford", category: "graph", slug: "/graph", complexity: "O(V·E)", algorithmId: "graph-bellman-ford" },
  { name: "Floyd-Warshall", category: "graph", slug: "/graph", complexity: "O(V³)", algorithmId: "graph-floyd-warshall" },
  { name: "Kruskal MST", category: "graph", slug: "/graph", complexity: "O(E log E)", algorithmId: "graph-kruskal" },
  { name: "Prim MST", category: "graph", slug: "/graph", complexity: "O((V+E) log V)", algorithmId: "graph-prim" },
  { name: "Topological Sort", category: "graph", slug: "/graph", complexity: "O(V+E)", algorithmId: "graph-topological-sort" },
  { name: "Tarjan SCC", category: "graph", slug: "/graph", complexity: "O(V+E)", algorithmId: "graph-tarjan-scc" },
  // Dynamic Programming
  { name: "Fibonacci DP", category: "dp", slug: "/dp", complexity: "O(n)", algorithmId: "fibonacci-dp" },
  { name: "0/1 Knapsack", category: "dp", slug: "/dp", complexity: "O(nW)", algorithmId: "knapsack-dp" },
  { name: "LCS", category: "dp", slug: "/dp", complexity: "O(mn)", algorithmId: "lcs-dp" },
  { name: "Edit Distance", category: "dp", slug: "/dp", complexity: "O(mn)", algorithmId: "edit-distance-dp" },
  { name: "Coin Change", category: "dp", slug: "/dp", complexity: "O(nA)", algorithmId: "coin-change-dp" },
  { name: "Matrix Chain", category: "dp", slug: "/dp", complexity: "O(n³)", algorithmId: "matrix-chain-dp" },
  // Geometry
  { name: "Graham Scan", category: "geometry", slug: "/geometry", complexity: "O(n log n)", algorithmId: "graham-scan" },
  { name: "Jarvis March", category: "geometry", slug: "/geometry", complexity: "O(nh)", algorithmId: "jarvis-march" },
  { name: "Voronoi Diagram", category: "geometry", slug: "/geometry", complexity: "O(n²)", algorithmId: "voronoi-diagram" },
  { name: "Sweep Line", category: "geometry", slug: "/geometry", complexity: "O((n+k) log n)", algorithmId: "sweep-line-intersection" },
  { name: "Delaunay", category: "geometry", slug: "/geometry", complexity: "O(n log n)", algorithmId: "delaunay-triangulation" },
  // AI / ML
  { name: "Linear Regression", category: "ai", slug: "/ai", complexity: "O(n·e)", algorithmId: "linear-regression" },
  { name: "K-Nearest Neighbors", category: "ai", slug: "/ai", complexity: "O(n·d)", algorithmId: "knn" },
  { name: "K-Means", category: "ai", slug: "/ai", complexity: "O(nkd)", algorithmId: "k-means" },
  { name: "Perceptron", category: "ai", slug: "/ai", complexity: "O(n·e)", algorithmId: "perceptron" },
  { name: "Neural Network", category: "ai", slug: "/ai", complexity: "O(n·e·h)", algorithmId: "neural-net" },
  // Optimization
  { name: "Gradient Descent", category: "optimization", slug: "/optimization", complexity: "O(n·i)", algorithmId: "gradient-descent" },
  { name: "Hill Climbing", category: "optimization", slug: "/optimization", complexity: "O(i)", algorithmId: "hill-climbing" },
  { name: "Simulated Annealing", category: "optimization", slug: "/optimization", complexity: "O(i)", algorithmId: "simulated-annealing" },
  { name: "Genetic Algorithm", category: "optimization", slug: "/optimization", complexity: "O(p·g)", algorithmId: "genetic-algorithm" },
  // Numerical
  { name: "Newton's Method", category: "numerical", slug: "/numerical", complexity: "O(log log(1/ε))", algorithmId: "newton-method" },
  { name: "Bisection Method", category: "numerical", slug: "/numerical", complexity: "O(log(1/ε))", algorithmId: "bisection" },
  { name: "Numerical Integration", category: "numerical", slug: "/numerical", complexity: "O(n)", algorithmId: "numerical-integration" },
  { name: "Monte Carlo Pi", category: "numerical", slug: "/numerical", complexity: "O(n)", algorithmId: "monte-carlo-pi" },
  // Games & Puzzles
  { name: "Minimax (Tic-Tac-Toe)", category: "games", slug: "/games", complexity: "O(b^m)", algorithmId: "minimax" },
  { name: "Tower of Hanoi", category: "games", slug: "/games", complexity: "O(2^n)", algorithmId: "tower-of-hanoi" },
  { name: "Sudoku Solver", category: "games", slug: "/games", complexity: "O(9^m)", algorithmId: "sudoku-solver" },
  { name: "Game of Life", category: "games", slug: "/games", complexity: "O(rc)", algorithmId: "game-of-life" },
  { name: "Knight's Tour", category: "games", slug: "/games", complexity: "O(8^(n²))", algorithmId: "knight-tour" },
  { name: "N-Queens", category: "games", slug: "/games", complexity: "O(n!)", algorithmId: "n-queens" },
  { name: "15-Puzzle (A*)", category: "games", slug: "/games", complexity: "O(b^d)", algorithmId: "fifteen-puzzle" },
  // Fractals
  { name: "Mandelbrot Set", category: "fractals", slug: "/fractals", complexity: "O(n·k)", algorithmId: "mandelbrot" },
  { name: "Julia Set", category: "fractals", slug: "/fractals", complexity: "O(n·k)", algorithmId: "julia" },
  { name: "Sierpinski Triangle", category: "fractals", slug: "/fractals", complexity: "O(3ⁿ)", algorithmId: "sierpinski" },
  { name: "Koch Snowflake", category: "fractals", slug: "/fractals", complexity: "O(4ⁿ)", algorithmId: "koch" },
  { name: "L-Systems", category: "fractals", slug: "/fractals", complexity: "O(n^k)", algorithmId: "l-system" },
  // OS -- CPU Scheduling
  { name: "FCFS Scheduling", category: "os", slug: "/os", complexity: "O(n)", algorithmId: "os-fcfs" },
  { name: "SJF Scheduling", category: "os", slug: "/os", complexity: "O(n²)", algorithmId: "os-sjf" },
  { name: "SRTF Scheduling", category: "os", slug: "/os", complexity: "O(n²)", algorithmId: "os-srtf" },
  { name: "Round Robin", category: "os", slug: "/os", complexity: "O(n·q)", algorithmId: "os-round-robin" },
  { name: "Priority Scheduling", category: "os", slug: "/os", complexity: "O(n²)", algorithmId: "os-priority" },
  // OS -- Page Replacement
  { name: "FIFO Page Replacement", category: "os", slug: "/os", complexity: "O(1)", algorithmId: "os-fifo-page" },
  { name: "LRU Page Replacement", category: "os", slug: "/os", complexity: "O(k)", algorithmId: "os-lru-page" },
  { name: "LFU Page Replacement", category: "os", slug: "/os", complexity: "O(k)", algorithmId: "os-lfu-page" },
  { name: "Optimal Page Replacement", category: "os", slug: "/os", complexity: "O(k·n)", algorithmId: "os-optimal-page" },
  // OS -- Disk Scheduling
  { name: "FCFS Disk Scheduling", category: "os", slug: "/os", complexity: "O(n)", algorithmId: "os-fcfs-disk" },
  { name: "SSTF Disk Scheduling", category: "os", slug: "/os", complexity: "O(n²)", algorithmId: "os-sstf-disk" },
  { name: "SCAN Disk Scheduling", category: "os", slug: "/os", complexity: "O(n log n)", algorithmId: "os-scan-disk" },
  { name: "C-SCAN Disk Scheduling", category: "os", slug: "/os", complexity: "O(n log n)", algorithmId: "os-cscan-disk" },
  { name: "LOOK Disk Scheduling", category: "os", slug: "/os", complexity: "O(n log n)", algorithmId: "os-look-disk" },
  // OS -- Banker's
  { name: "Banker's Algorithm", category: "os", slug: "/os", complexity: "O(n²·m)", algorithmId: "os-bankers" },
  // Cryptography
  { name: "Diffie-Hellman", category: "crypto", slug: "/crypto", complexity: "O(log n)", algorithmId: "diffie-hellman" },
  { name: "Caesar Cipher", category: "crypto", slug: "/crypto", complexity: "O(n)", algorithmId: "caesar" },
  { name: "Vigenere Cipher", category: "crypto", slug: "/crypto", complexity: "O(n)", algorithmId: "vigenere" },
  { name: "Hash Avalanche", category: "crypto", slug: "/crypto", complexity: "O(n)", algorithmId: "hash-avalanche" },
];
