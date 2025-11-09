import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Data points for linear regression
  dataPoints: [],
  pointCount: 50,
  
  // Linear Regression model parameters
  slope: 0,
  intercept: 0,
  
  // KNN parameters
  k: 3, // Number of neighbors for KNN
  
  // Training parameters
  running: false,
  learningRate: 0.01,
  iterations: 0,
  maxIterations: 100,
  
  // Statistics
  mse: 0, // Mean Squared Error
  rmse: 0, // Root Mean Squared Error
  rSquared: 0, // R-squared value
  
  // Visualization
  showFitLine: true,
  showDataPoints: true,
  dataPointsColor: "#3B82F6",
  fitLineColor: "#EF4444",
  
  // Speed control
  speed: 50,
  maxSpeed: 200,
};

export const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setDataPoints: (state, action) => {
      state.dataPoints = action.payload;
      state.pointCount = action.payload.length;
    },
    setSlope: (state, action) => {
      state.slope = action.payload;
    },
    setIntercept: (state, action) => {
      state.intercept = action.payload;
    },
    setK: (state, action) => {
      state.k = action.payload;
    },
    setRunning: (state, action) => {
      state.running = action.payload;
    },
    setLearningRate: (state, action) => {
      state.learningRate = action.payload;
    },
    setIterations: (state, action) => {
      state.iterations = action.payload;
    },
    setMaxIterations: (state, action) => {
      state.maxIterations = action.payload;
    },
    setMSE: (state, action) => {
      state.mse = action.payload;
    },
    setRMSE: (state, action) => {
      state.rmse = action.payload;
    },
    setRSquared: (state, action) => {
      state.rSquared = action.payload;
    },
    setShowFitLine: (state, action) => {
      state.showFitLine = action.payload;
    },
    setShowDataPoints: (state, action) => {
      state.showDataPoints = action.payload;
    },
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
    resetStats: (state) => {
      state.slope = 0;
      state.intercept = 0;
      state.iterations = 0;
      state.mse = 0;
      state.rmse = 0;
      state.rSquared = 0;
    },
    incrementIterations: (state) => {
      state.iterations++;
    },
    addPoint: (state, action) => {
      const newPoint = {
        x: action.payload.x,
        y: action.payload.y,
        class: -1, // Unclassified
        trueClass: -2, // User-added point marker
      };
      state.dataPoints.push(newPoint);
      state.pointCount = state.dataPoints.length;
    },
  },
});

export const {
  setDataPoints,
  setSlope,
  setIntercept,
  setK,
  setRunning,
  setLearningRate,
  setIterations,
  setMaxIterations,
  setMSE,
  setRMSE,
  setRSquared,
  setShowFitLine,
  setShowDataPoints,
  setSpeed,
  resetStats,
  incrementIterations,
  addPoint,
} = aiSlice.actions;

export default aiSlice.reducer;
