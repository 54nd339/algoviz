import { store } from "@/redux/store";
import { setGrid } from "@/redux/reducers/pathSlice";
import generateGrid from "./generateGrid";

function cloneAndResetGrid(grid) {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isWall: true,
      isVisited: false,
      distance: Infinity,
      heuristic: Infinity,
      previousNode: null,
    }))
  );
}

function randomOdd(limit) {
  const candidates = [];
  for (let i = 1; i < limit - 1; i += 2) {
    candidates.push(i);
  }
  if (candidates.length === 0) {
    return 0;
  }
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

function getUnvisitedNeighbors(row, col, visited, height, width) {
  const deltas = [
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
  ];
  const neighbors = [];

  for (const [dr, dc] of deltas) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow <= 0 || newRow >= height - 1) continue;
    if (newCol <= 0 || newCol >= width - 1) continue;
    if (visited[newRow][newCol]) continue;

    neighbors.push({ row: newRow, col: newCol });
  }

  return neighbors;
}

function ensureNodeAccessible(grid, node) {
  if (!node) return;
  const { x, y } = node;
  if (!grid[x] || !grid[x][y]) return;

  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  grid[x][y].isWall = false;

  const hasOpenNeighbor = directions.some(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    return (
      nx >= 0 && nx < height &&
      ny >= 0 && ny < width &&
      !grid[nx][ny].isWall
    );
  });

  if (!hasOpenNeighbor) {
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < height && ny >= 0 && ny < width) {
        grid[nx][ny].isWall = false;
        break;
      }
    }
  }
}

function ensureStartFinishClear(grid, startNode, finishNode) {
  ensureNodeAccessible(grid, startNode);
  ensureNodeAccessible(grid, finishNode);
}

function generateMaze() {
  generateGrid(true);

  const state = store.getState().path;
  const { grid, startNode, finishNode } = state;

  if (!grid.length || !grid[0]?.length) {
    return;
  }

  const newGrid = cloneAndResetGrid(grid);
  const height = newGrid.length;
  const width = newGrid[0].length;

  if (height < 3 || width < 3) {
    for (const row of newGrid) {
      for (const node of row) {
        node.isWall = false;
      }
    }
    ensureStartFinishClear(newGrid, startNode, finishNode);
    store.dispatch(setGrid(newGrid));
    return;
  }

  const visited = Array.from({ length: height }, () =>
    Array(width).fill(false)
  );

  const startRow = randomOdd(height);
  const startCol = randomOdd(width);

  visited[startRow][startCol] = true;
  newGrid[startRow][startCol].isWall = false;

  const stack = [{ row: startRow, col: startCol }];

  while (stack.length) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(
      current.row,
      current.col,
      visited,
      height,
      width
    );

    if (!neighbors.length) {
      stack.pop();
      continue;
    }

    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    const betweenRow = current.row + (next.row - current.row) / 2;
    const betweenCol = current.col + (next.col - current.col) / 2;

    visited[next.row][next.col] = true;
    newGrid[next.row][next.col].isWall = false;
    newGrid[betweenRow][betweenCol].isWall = false;

    stack.push({ row: next.row, col: next.col });
  }

  ensureStartFinishClear(newGrid, startNode, finishNode);
  store.dispatch(setGrid(newGrid));
}

export default generateMaze;