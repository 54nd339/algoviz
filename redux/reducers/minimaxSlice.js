import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tree: null,
  maxDepth: 3,
  branchingFactor: 3,
  minLeafValue: -9,
  maxLeafValue: 9,
  isRunning: false,
  speed: 400,
  maxSpeed: 800,
  status: "ready",
  evaluatedCount: 0,
  prunedCount: 0,
  selectedPath: [],
  currentNodeId: null,
};

const minimaxSlice = createSlice({
  name: "minimax",
  initialState,
  reducers: {
    setTree: (state, action) => {
      state.tree = action.payload;
    },
    setMaxDepth: (state, action) => {
      state.maxDepth = action.payload;
    },
    setBranchingFactor: (state, action) => {
      state.branchingFactor = action.payload;
    },
    setLeafRange: (state, action) => {
      const { min, max } = action.payload;
      state.minLeafValue = min;
      state.maxLeafValue = max;
    },
    setIsRunning: (state, action) => {
      state.isRunning = action.payload;
      if (action.payload) {
        state.status = "running";
      }
    },
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setEvaluatedCount: (state, action) => {
      state.evaluatedCount = action.payload;
    },
    incrementEvaluated: (state) => {
      state.evaluatedCount += 1;
    },
    setPrunedCount: (state, action) => {
      state.prunedCount = action.payload;
    },
    incrementPruned: (state) => {
      state.prunedCount += 1;
    },
    setSelectedPath: (state, action) => {
      state.selectedPath = action.payload;
    },
    setCurrentNodeId: (state, action) => {
      state.currentNodeId = action.payload;
    },
    resetMetrics: (state) => {
      state.evaluatedCount = 0;
      state.prunedCount = 0;
      state.selectedPath = [];
      state.currentNodeId = null;
      state.status = "ready";
    },
  },
});

export const {
  setTree,
  setMaxDepth,
  setBranchingFactor,
  setLeafRange,
  setIsRunning,
  setSpeed,
  setStatus,
  setEvaluatedCount,
  incrementEvaluated,
  setPrunedCount,
  incrementPruned,
  setSelectedPath,
  setCurrentNodeId,
  resetMetrics,
} = minimaxSlice.actions;

export default minimaxSlice.reducer;

