import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  board: null,
  isRunning: false,
  speed: 100,
  boardSize: 8,
  startRow: 0,
  startCol: 0,
  currentPath: [],
  visitedCount: 0,
  totalMoves: 0,
  isComplete: false,
  message: "Select a starting position and press Solve",
};

const touringKnightSlice = createSlice({
  name: "touringKnight",
  initialState,
  reducers: {
    setBoard: (state, action) => {
      state.board = action.payload;
    },
    setIsRunning: (state, action) => {
      state.isRunning = action.payload;
    },
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
    setBoardSize: (state, action) => {
      state.boardSize = action.payload;
      state.currentPath = [];
      state.visitedCount = 0;
      state.totalMoves = 0;
      state.isComplete = false;
      state.message = "Select a starting position and press Solve";
    },
    setStartPosition: (state, action) => {
      const { row, col } = action.payload;
      state.startRow = row;
      state.startCol = col;
      state.message = `Starting from (${row}, ${col}). Press Solve to begin.`;
    },
    setCurrentPath: (state, action) => {
      state.currentPath = action.payload;
    },
    setVisitedCount: (state, action) => {
      state.visitedCount = action.payload;
    },
    setTotalMoves: (state, action) => {
      state.totalMoves = action.payload;
    },
    setIsComplete: (state, action) => {
      state.isComplete = action.payload;
      if (action.payload) {
        state.message = "Tour Complete!";
      }
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    resetTour: (state) => {
      state.board = null;
      state.isRunning = false;
      state.currentPath = [];
      state.visitedCount = 0;
      state.totalMoves = 0;
      state.isComplete = false;
      state.message = "Select a starting position and press Solve";
    },
  },
});

export const {
  setBoard,
  setIsRunning,
  setSpeed,
  setBoardSize,
  setStartPosition,
  setCurrentPath,
  setVisitedCount,
  setTotalMoves,
  setIsComplete,
  setMessage,
  resetTour,
} = touringKnightSlice.actions;

export default touringKnightSlice.reducer;
