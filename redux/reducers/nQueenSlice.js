import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  board: null,
  isRunning: false,
  speed: 100,
  boardSize: 8,
  solutions: [],
  currentSolution: 0,
  placedQueens: 0,
  totalSolutions: 0,
  isComplete: false,
  message: "Press Solve to find all solutions",
};

const nQueenSlice = createSlice({
  name: "nQueen",
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
      state.solutions = [];
      state.currentSolution = 0;
      state.placedQueens = 0;
      state.totalSolutions = 0;
      state.isComplete = false;
      state.message = "Press Solve to find all solutions";
    },
    setSolutions: (state, action) => {
      state.solutions = action.payload;
    },
    setCurrentSolution: (state, action) => {
      state.currentSolution = action.payload;
    },
    setPlacedQueens: (state, action) => {
      state.placedQueens = action.payload;
    },
    setTotalSolutions: (state, action) => {
      state.totalSolutions = action.payload;
    },
    setIsComplete: (state, action) => {
      state.isComplete = action.payload;
      if (action.payload) {
        state.message = `Found ${state.totalSolutions} solution(s)!`;
      }
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    resetSolver: (state) => {
      state.board = null;
      state.isRunning = false;
      state.solutions = [];
      state.currentSolution = 0;
      state.placedQueens = 0;
      state.totalSolutions = 0;
      state.isComplete = false;
      state.message = "Press Solve to find all solutions";
    },
  },
});

export const {
  setBoard,
  setIsRunning,
  setSpeed,
  setBoardSize,
  setSolutions,
  setCurrentSolution,
  setPlacedQueens,
  setTotalSolutions,
  setIsComplete,
  setMessage,
  resetSolver,
} = nQueenSlice.actions;

export default nQueenSlice.reducer;
