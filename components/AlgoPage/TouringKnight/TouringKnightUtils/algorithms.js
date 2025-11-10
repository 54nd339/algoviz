// Knight moves: 8 possible L-shaped moves
const knightMoves = [
  [2, 1], [2, -1], [-2, 1], [-2, -1],
  [1, 2], [1, -2], [-1, 2], [-1, -2],
];

// Warnsdorff's heuristic: prioritize moves to squares with fewer onward moves
const countOnwardMoves = (board, row, col, size) => {
  let count = 0;
  for (const [dx, dy] of knightMoves) {
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && board[newRow][newCol] === -1) {
      count++;
    }
  }
  return count;
};

// Warnsdorff's algorithm with backtracking
export const solveKnightTour = async (size, startRow, startCol, onUpdate, shouldStop) => {
  // Validate start position
  if (startRow === undefined || startRow === null || startCol === undefined || startCol === null) {
    console.error("Invalid start position", startRow, startCol);
    return { success: false, board: null, path: [], totalAttempts: 0 };
  }

  const board = Array(size).fill(null).map(() => Array(size).fill(-1));
  const path = [];
  let totalAttempts = 0;  // Track total recursive calls/move attempts

  const solve = async (row, col, moveNum) => {
    // Check if should stop
    if (shouldStop && shouldStop()) {
      return false;
    }

    totalAttempts++;  // Increment for each recursive call/move attempt

    board[row][col] = moveNum;
    path.push({ row, col, moveNum });

    if (moveNum === size * size - 1) {
      if (onUpdate) {
        await onUpdate(null, path, totalAttempts, true);
      }
      return true;
    }

    // Get all possible moves and sort by Warnsdorff's heuristic
    const possibleMoves = [];
    for (const [dx, dy] of knightMoves) {
      const newRow = row + dx;
      const newCol = col + dy;
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && board[newRow][newCol] === -1) {
        const onwardCount = countOnwardMoves(board, newRow, newCol, size);
        possibleMoves.push({ newRow, newCol, onwardCount });
      }
    }

    // Sort by fewest onward moves (Warnsdorff's rule)
    possibleMoves.sort((a, b) => a.onwardCount - b.onwardCount);

    // Try each move
    for (const { newRow, newCol } of possibleMoves) {
      if (shouldStop && shouldStop()) {
        return false;
      }

      if (onUpdate) {
        // Pass totalAttempts to track all moves including backtracks
        await onUpdate(null, path, totalAttempts, false);
      }

      if (await solve(newRow, newCol, moveNum + 1)) {
        return true;
      }

      // Backtrack
      board[newRow][newCol] = -1;
      path.pop();
    }

    return false;
  };

  const success = await solve(startRow, startCol, 0);
  return { success, board, path, totalAttempts };
};

// Initialize empty board
export const initializeBoard = (size) => {
  return Array(size).fill(null).map(() => Array(size).fill(-1));
};

// Get the current path visualization
export const getPathVisualization = (path, size) => {
  const visualization = Array(size).fill(null).map(() => Array(size).fill(-1));
  path.forEach(({ row, col, moveNum }) => {
    // Store moveNum directly (starting from 0)
    visualization[row][col] = moveNum;
  });
  return visualization;
};
