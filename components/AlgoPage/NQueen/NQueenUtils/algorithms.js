// N-Queen solver using backtracking
export const solveNQueens = async (n, onUpdate) => {
  const solutions = [];
  const board = Array(n).fill(null).map(() => Array(n).fill(0));
  const columns = new Set();
  const diag1 = new Set(); // row - col
  const diag2 = new Set(); // row + col

  const solve = async (row) => {
    if (row === n) {
      // Found a solution
      solutions.push(board.map(r => [...r]));
      if (onUpdate) {
        await onUpdate(board, row, solutions.length, false);
      }
      return;
    }

    for (let col = 0; col < n; col++) {
      const d1 = row - col;
      const d2 = row + col;

      if (!columns.has(col) && !diag1.has(d1) && !diag2.has(d2)) {
        // Place queen
        board[row][col] = 1;
        columns.add(col);
        diag1.add(d1);
        diag2.add(d2);

        if (onUpdate) {
          await onUpdate(board, row + 1, solutions.length, false);
        }

        await solve(row + 1);

        // Remove queen (backtrack)
        board[row][col] = 0;
        columns.delete(col);
        diag1.delete(d1);
        diag2.delete(d2);
      }
    }
  };

  await solve(0);
  return solutions;
};

// Initialize empty board
export const initializeBoard = (size) => {
  return Array(size).fill(null).map(() => Array(size).fill(0));
};

// Get the current board state with queens placed
export const getBoardVisualization = (board) => {
  return board;
};

// Count solutions for a given board size
export const countSolutions = async (n) => {
  let count = 0;
  const board = Array(n).fill(null).map(() => Array(n).fill(0));
  const columns = new Set();
  const diag1 = new Set();
  const diag2 = new Set();

  const solve = (row) => {
    if (row === n) {
      count++;
      return;
    }

    for (let col = 0; col < n; col++) {
      const d1 = row - col;
      const d2 = row + col;

      if (!columns.has(col) && !diag1.has(d1) && !diag2.has(d2)) {
        columns.add(col);
        diag1.add(d1);
        diag2.add(d2);

        solve(row + 1);

        columns.delete(col);
        diag1.delete(d1);
        diag2.delete(d2);
      }
    }
  };

  solve(0);
  return count;
};
