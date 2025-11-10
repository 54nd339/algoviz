// Initialize grid with random pattern
export const initializeRandomGrid = (size) => {
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => (Math.random() > 0.7 ? 1 : 0))
  );
  return grid;
};

// Initialize empty grid
export const initializeEmptyGrid = (size) => {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
};

// Count alive neighbors
const countAliveNeighbors = (grid, row, col, size) => {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newRow = (row + i + size) % size; // Wrapping enabled
      const newCol = (col + j + size) % size;
      count += grid[newRow][newCol];
    }
  }
  return count;
};

// Apply Game of Life rules
export const computeNextGeneration = (grid) => {
  const size = grid.length;
  const newGrid = Array.from({ length: size }, () => Array.from({ length: size }, () => 0));

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const aliveNeighbors = countAliveNeighbors(grid, i, j, size);
      const isAlive = grid[i][j] === 1;

      // Game of Life rules:
      // 1. Any live cell with 2-3 neighbors survives
      // 2. Any dead cell with exactly 3 neighbors becomes alive
      // 3. All other cells die or stay dead
      if (isAlive && (aliveNeighbors === 2 || aliveNeighbors === 3)) {
        newGrid[i][j] = 1;
      } else if (!isAlive && aliveNeighbors === 3) {
        newGrid[i][j] = 1;
      }
    }
  }

  return newGrid;
};

// Count alive cells
export const countAliveCells = (grid) => {
  let count = 0;
  for (let row of grid) {
    for (let cell of row) {
      if (cell === 1) count++;
    }
  }
  return count;
};
