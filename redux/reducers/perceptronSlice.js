import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  network: null,
  layers: 3,
  maxLayers: 5,
  neuronsPerLayer: 5,
  maxNeuronsPerLayer: 10,
  speed: 400,
  maxSpeed: 800,
  isRunning: false,
  status: "ready",
  currentEpoch: 0,
  totalEpochs: 50,
  learningRate: 0.1,
  loss: 0,
  accuracy: 0,
  trainingHistory: [],
  currentInput: null,
  currentOutput: null,
  weights: [],
  biases: [],
  activationFunction: "none",
};

const perceptronSlice = createSlice({
  name: "perceptron",
  initialState,
  reducers: {
    setNetwork: (state, action) => {
      state.network = action.payload;
    },
    setLayers: (state, action) => {
      state.layers = action.payload;
    },
    setNeuronsPerLayer: (state, action) => {
      state.neuronsPerLayer = action.payload;
    },
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
    setIsRunning: (state, action) => {
      state.isRunning = action.payload;
      if (action.payload) {
        state.status = "running";
      }
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setCurrentEpoch: (state, action) => {
      state.currentEpoch = action.payload;
    },
    incrementEpoch: (state) => {
      state.currentEpoch += 1;
    },
    setTotalEpochs: (state, action) => {
      state.totalEpochs = action.payload;
    },
    setLearningRate: (state, action) => {
      state.learningRate = action.payload;
    },
    setLoss: (state, action) => {
      state.loss = action.payload;
    },
    setAccuracy: (state, action) => {
      state.accuracy = action.payload;
    },
    setTrainingHistory: (state, action) => {
      state.trainingHistory = action.payload;
    },
    addToHistory: (state, action) => {
      state.trainingHistory.push(action.payload);
    },
    setCurrentInput: (state, action) => {
      state.currentInput = action.payload;
    },
    setCurrentOutput: (state, action) => {
      state.currentOutput = action.payload;
    },
    setWeights: (state, action) => {
      state.weights = action.payload;
    },
    setBiases: (state, action) => {
      state.biases = action.payload;
    },
    setActivationFunction: (state, action) => {
      state.activationFunction = action.payload;
    },
    resetMetrics: (state) => {
      state.currentEpoch = 0;
      state.loss = 0;
      state.accuracy = 0;
      state.trainingHistory = [];
      state.currentInput = null;
      state.currentOutput = null;
      state.status = "ready";
    },
  },
});

export const {
  setNetwork,
  setLayers,
  setNeuronsPerLayer,
  setSpeed,
  setIsRunning,
  setStatus,
  setCurrentEpoch,
  incrementEpoch,
  setTotalEpochs,
  setLearningRate,
  setLoss,
  setAccuracy,
  setTrainingHistory,
  addToHistory,
  setCurrentInput,
  setCurrentOutput,
  setWeights,
  setBiases,
  setActivationFunction,
  resetMetrics,
} = perceptronSlice.actions;

export default perceptronSlice.reducer;
