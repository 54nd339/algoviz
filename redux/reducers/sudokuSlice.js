import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  board: null,
  originalBoard: null,
  speed: 50,
  maxSpeed: 500,
  isRunning: false,
  status: "ready",
  backtrackCount: 0,
  filledCells: 0,
  totalSteps: 0,
  currentCell: null,
  boardSize: 9,
  userBoard: null, // For user input mode
  isUserInputMode: false,
};

const sudokuSlice = createSlice({
  name: "sudoku",
  initialState,
  reducers: {
    setBoard: (state, action) => {
      state.board = action.payload;
    },
    setOriginalBoard: (state, action) => {
      state.originalBoard = action.payload;
    },
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
    setIsRunning: (state, action) => {
      state.isRunning = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    incrementBacktrackCount: (state) => {
      state.backtrackCount += 1;
    },
    setFilledCells: (state, action) => {
      state.filledCells = action.payload;
    },
    incrementTotalSteps: (state) => {
      state.totalSteps += 1;
    },
    setCurrentCell: (state, action) => {
      state.currentCell = action.payload;
    },
    resetMetrics: (state) => {
      state.backtrackCount = 0;
      state.filledCells = 0;
      state.totalSteps = 0;
      state.status = "ready";
    },
    setBoardSize: (state, action) => {
      state.boardSize = action.payload;
    },
    setUserBoard: (state, action) => {
      state.userBoard = action.payload;
    },
    setUserInputMode: (state, action) => {
      state.isUserInputMode = action.payload;
    },
    setCellValue: (state, action) => {
      const { row, col, value } = action.payload;
      if (state.userBoard && state.userBoard[row]) {
        state.userBoard[row][col] = value;
      }
    },
  },
});

export const {
  setBoard,
  setOriginalBoard,
  setSpeed,
  setIsRunning,
  setStatus,
  incrementBacktrackCount,
  setFilledCells,
  incrementTotalSteps,
  setCurrentCell,
  resetMetrics,
  setBoardSize,
  setUserBoard,
  setUserInputMode,
  setCellValue,
} = sudokuSlice.actions;

export default sudokuSlice.reducer;
