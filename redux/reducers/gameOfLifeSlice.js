import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  grid: null,
  originalGrid: null,
  speed: 50,
  maxSpeed: 500,
  isRunning: false,
  status: "ready",
  generation: 0,
  aliveCells: 0,
  totalIterations: 0,
  gridSize: 50,
  cellSize: 12,
  isDrawMode: false,
};

const gameOfLifeSlice = createSlice({
  name: "gameOfLife",
  initialState,
  reducers: {
    setGrid: (state, action) => {
      state.grid = action.payload;
    },
    setOriginalGrid: (state, action) => {
      state.originalGrid = action.payload;
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
    incrementGeneration: (state) => {
      state.generation += 1;
    },
    setAliveCells: (state, action) => {
      state.aliveCells = action.payload;
    },
    incrementTotalIterations: (state) => {
      state.totalIterations += 1;
    },
    resetMetrics: (state) => {
      state.generation = 0;
      state.aliveCells = 0;
      state.totalIterations = 0;
      state.status = "ready";
    },
    setGridSize: (state, action) => {
      state.gridSize = action.payload;
    },
    setCellSize: (state, action) => {
      state.cellSize = action.payload;
    },
    setDrawMode: (state, action) => {
      state.isDrawMode = action.payload;
    },
    toggleCell: (state, action) => {
      const { row, col } = action.payload;
      if (state.grid && state.grid[row]) {
        state.grid[row][col] = state.grid[row][col] ? 0 : 1;
      }
    },
  },
});

export const {
  setGrid,
  setOriginalGrid,
  setSpeed,
  setIsRunning,
  setStatus,
  incrementGeneration,
  setAliveCells,
  incrementTotalIterations,
  resetMetrics,
  setGridSize,
  setCellSize,
  setDrawMode,
  toggleCell,
} = gameOfLifeSlice.actions;

export default gameOfLifeSlice.reducer;
