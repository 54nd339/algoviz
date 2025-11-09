import { MakeDelay } from "@/utils";
import { store } from "@/redux/store";
import {
  setBoard,
  incrementBacktrackCount,
  incrementTotalSteps,
  setCurrentCell,
  setIsRunning,
  setStatus,
  resetMetrics,
  setFilledCells,
} from "@/redux/reducers/sudokuSlice";

// Get box size based on board size
const getBoxSize = (size) => {
  if (size === 4) return 2;
  if (size === 6) return 2; // 2x3 boxes
  if (size === 9) return 3;
  if (size === 16) return 4;
  return 3;
};

// Get valid numbers for a given size
const getValidNumbers = (size) => {
  const numbers = [];
  for (let i = 1; i <= size; i++) {
    numbers.push(i);
  }
  return numbers;
};

// Generate an empty Sudoku board
export const generateEmptyBoard = (size = 9) => {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));
};

// Check if placing a number is valid
const isValid = (board, row, col, num, size = 9) => {
  const boxSize = getBoxSize(size);

  // Check row
  for (let j = 0; j < size; j++) {
    if (board[row][j] === num) return false;
  }

  // Check column
  for (let i = 0; i < size; i++) {
    if (board[i][col] === num) return false;
  }

  // Check box
  const boxRow = Math.floor(row / boxSize) * boxSize;
  const boxCol = Math.floor(col / boxSize) * boxSize;
  const boxHeight = boxSize;
  const boxWidth = size === 6 ? 3 : boxSize;

  for (let i = boxRow; i < boxRow + boxHeight; i++) {
    for (let j = boxCol; j < boxCol + boxWidth; j++) {
      if (board[i][j] === num) return false;
    }
  }

  return true;
};

// Generate a complete valid board - simple and fast
const generateCompleteBoard = (size = 9) => {
  const board = generateEmptyBoard(size);
  
  // Simple backtracking from top-left to bottom-right
  const solve = (position = 0) => {
    if (position === size * size) {
      return true; // All cells filled successfully
    }

    const row = Math.floor(position / size);
    const col = position % size;

    // Shuffle numbers for randomness
    const numbers = getValidNumbers(size).sort(() => Math.random() - 0.5);

    for (const num of numbers) {
      if (isValid(board, row, col, num, size)) {
        board[row][col] = num;

        if (solve(position + 1)) {
          return true;
        }

        board[row][col] = 0; // Backtrack
      }
    }

    return false;
  };

  // Keep trying until we get a valid board (usually succeeds on first try)
  let attempts = 0;
  while (!solve() && attempts < 10) {
    // Reset board
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        board[i][j] = 0;
      }
    }
    attempts++;
  }

  return board;
};

// Helper to check if cell was originally filled
const wasOriginal = (row, col, size) => {
  return false; // All cells start empty in generation
};

// Generate a valid Sudoku puzzle (now async for large boards)
export const generateSudokuPuzzle = async (difficulty = "medium", size = 9) => {
  // Generate a complete board (this is the slow part for large sizes)
  const completedBoard = generateCompleteBoard(size);

  // Yield to event loop after generation
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Create puzzle by removing numbers based on difficulty
  const puzzle = completedBoard.map((row) => [...row]);
  const difficultyMap = {
    easy: Math.floor(size * 2),
    medium: Math.floor(size * 2.5),
    hard: Math.floor(size * 3),
  };
  const cellsToRemove = difficultyMap[difficulty] || Math.floor(size * 2.5);
  let removed = 0;
  let attempts = 0;
  const maxAttempts = size * size * 2; // Prevent infinite loops

  while (removed < cellsToRemove && attempts < maxAttempts) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }

    attempts++;
  }

  return puzzle;
};

// Solve Sudoku using backtracking
export const solveSudoku = async () => {
  const state = store.getState().sudoku;

  if (!state.board || state.isRunning) {
    return;
  }

  const board = JSON.parse(JSON.stringify(state.board));
  const originalBoard = JSON.parse(JSON.stringify(state.originalBoard));
  const size = state.boardSize;

  store.dispatch(resetMetrics());
  store.dispatch(setIsRunning(true));

  try {
    const solved = await solve(board, originalBoard, size);

    if (solved) {
      store.dispatch(setStatus("solved"));
    } else {
      store.dispatch(setStatus("unsolvable"));
    }
  } catch (error) {
    if (error.message !== "stopped") {
      console.error(error);
      store.dispatch(setStatus("error"));
    } else {
      store.dispatch(setStatus("stopped"));
    }
  } finally {
    store.dispatch(setIsRunning(false));
  }
};

// Recursive solve function
const solve = async (board, originalBoard, size = 9) => {
  const state = store.getState().sudoku;

  if (!state.isRunning) {
    throw new Error("stopped");
  }

  // Find empty cell
  let emptyCell = null;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] === 0) {
        emptyCell = { row: i, col: j };
        break;
      }
    }
    if (emptyCell) break;
  }

  // No empty cell - solved!
  if (!emptyCell) {
    return true;
  }

  store.dispatch(setCurrentCell(emptyCell));
  store.dispatch(incrementTotalSteps());

  const { row, col } = emptyCell;
  const validNumbers = getValidNumbers(size);

  // Try each number
  for (const num of validNumbers) {
    if (isValid(board, row, col, num, size)) {
      board[row][col] = num;
      store.dispatch(setBoard(JSON.parse(JSON.stringify(board))));

      // Count filled cells
      let filled = 0;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (board[i][j] !== 0 && originalBoard[i][j] === 0) {
            filled++;
          }
        }
      }
      store.dispatch(setFilledCells(filled));

      await MakeDelay(state.speed);

      if (await solve(board, originalBoard, size)) {
        return true;
      }

      // Backtrack
      board[row][col] = 0;
      store.dispatch(setBoard(JSON.parse(JSON.stringify(board))));
      store.dispatch(incrementBacktrackCount());
      await MakeDelay(state.speed);
    }
  }

  return false;
};

export default solveSudoku;
