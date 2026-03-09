# AlgoViz

AlgoViz is a web app for visualizing various algorithms. It is built using Next.js and TailwindCSS. It is a work in progress and I will be adding more algorithms in the future.

## Technologies used

- Next.js
- Redux
- TailwindCSS
- Docker
- GitHub Actions (CI/CD)

## Features

### Sorting Algorithms
- Bubble Sort, Insertion Sort, Selection Sort
- Merge Sort, Quick Sort, Heap Sort
- Radix Sort

### Searching Algorithms
- Linear Search, Binary Search
- Jump Search, Interpolation Search

### Graph Algorithms
- **Pathfinding**: Depth-First Search (DFS), Breadth-First Search (BFS), A* Search
- **Minimum Spanning Tree**: Prim's Algorithm, Kruskal's Algorithm
- **Shortest Path**: Dijkstra's, Bellman-Ford, Floyd-Warshall

### Game & Puzzle Solvers
- Tower of Hanoi Solver
- N-Queen Problem Solver
- Sudoku Solver (Backtracking)
- Knight's Tour (Warnsdorff's Heuristic)
- Minimax with Alpha-Beta Pruning

### Machine Learning & AI
- **Linear Regression** (with interactive gradient descent)
- **K-Nearest Neighbors** (KNN)
- **K-Means Clustering**
- **Perceptron** (Neural Networks)

### Cellular Automata
- **Conway's Game of Life**


## Installation

### Local Development
```bash
git clone https://github.com/54nd339/algoviz.git
cd algoviz
npm install
npm run dev
```

### Docker
```bash
docker build -t algoviz .
docker run -p 3000:3000 algoviz
```

### Production Build
```bash
npm run build
npm run start
```

## CI/CD

This project uses GitHub Actions for automated Docker builds and deployments:
- **On Push to Master**: Builds and pushes image to DockerHub with `:latest` tag
- **On Pull Request**: Validates Docker build for PRs

Required secrets for CI/CD:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`