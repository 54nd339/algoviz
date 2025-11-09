import { store } from "@/redux/store";
import {
  incrementIterations,
} from "@/redux/reducers/aiSlice";

/**
 * Generic Linear Regression Algorithm Handler
 * Can be used for any regression-based ML algorithm
 */

// Get algorithm-specific handlers from Redux state
const getAlgorithmHandlers = () => {
  const state = store.getState();
  const algoId = state.page.algoId;
  
  // Map algorithm IDs to their handlers
  const handlers = {
    "linear-regression": {
      calculateStep: calculateLinearRegressionStep,
      generateData: generateRegressionData,
    },
    "knn": {
      calculateStep: calculateKNNStep,
      generateData: generateKNNData,
    },
    "k-means": {
      calculateStep: calculateKMeansStep,
      generateData: generateKMeansData,
    },
  };
  
  return handlers[algoId] || handlers["linear-regression"];
};

/**
 * LINEAR REGRESSION ALGORITHM
 */

export const calculateMSE = (dataPoints, predictions) => {
  if (dataPoints.length === 0) return 0;
  let sumSquaredErrors = 0;
  dataPoints.forEach((point, i) => {
    const error = point.y - predictions[i];
    sumSquaredErrors += error * error;
  });
  return sumSquaredErrors / dataPoints.length;
};

export const calculateRMSE = (mse) => Math.sqrt(mse);

export const calculateRSquared = (dataPoints, predictions) => {
  if (dataPoints.length === 0) return 0;
  const meanY = dataPoints.reduce((sum, p) => sum + p.y, 0) / dataPoints.length;
  
  let tss = dataPoints.reduce((sum, p) => sum + (p.y - meanY) ** 2, 0);
  let rss = dataPoints.reduce((sum, p, i) => sum + (p.y - predictions[i]) ** 2, 0);
  
  return tss === 0 ? 0 : 1 - (rss / tss);
};

export const generateRegressionData = (count) => {
  const points = [];
  const slope = Math.random() * 4 - 2;
  const intercept = Math.random() * 4 - 2;
  const noise = 0.5;
  
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 10 - 5;
    const y = slope * x + intercept + (Math.random() - 0.5) * noise * 2;
    points.push({ x, y });
  }
  return points;
};

export const calculateLinearRegressionStep = () => {
  const state = store.getState().ai;
  const dataPoints = state.dataPoints;
  const learningRate = state.learningRate;
  let slope = state.slope;
  let intercept = state.intercept;
  const n = dataPoints.length;
  
  if (n === 0) return;
  
  let slopeGradient = 0, interceptGradient = 0;
  dataPoints.forEach((point) => {
    const predicted = slope * point.x + intercept;
    const error = predicted - point.y;
    slopeGradient += error * point.x;
    interceptGradient += error;
  });
  
  slope -= learningRate * (2 / n) * slopeGradient;
  intercept -= learningRate * (2 / n) * interceptGradient;
  
  // Update Redux with new parameters
  store.dispatch(require("@/redux/reducers/aiSlice").setSlope(slope));
  store.dispatch(require("@/redux/reducers/aiSlice").setIntercept(intercept));
  
  // Calculate metrics
  const predictions = dataPoints.map(p => slope * p.x + intercept);
  const mse = calculateMSE(dataPoints, predictions);
  const rmse = calculateRMSE(mse);
  const rSquared = calculateRSquared(dataPoints, predictions);
  
  store.dispatch(require("@/redux/reducers/aiSlice").setMSE(mse));
  store.dispatch(require("@/redux/reducers/aiSlice").setRMSE(rmse));
  store.dispatch(require("@/redux/reducers/aiSlice").setRSquared(rSquared));
};

/**
 * KNN PLACEHOLDER
 */
export const calculateKNNStep = () => {
  // KNN implementation will go here
};

export const generateKNNData = (count) => {
  // KNN data generation will go here
  return [];
};

/**
 * K-MEANS PLACEHOLDER
 */
export const calculateKMeansStep = () => {
  // K-means implementation will go here
};

export const generateKMeansData = (count) => {
  // K-means data generation will go here
  return [];
};

/**
 * GENERIC FUNCTIONS
 */

export const generateDataPoints = (count) => {
  const handlers = getAlgorithmHandlers();
  return handlers.generateData(count);
};

export const performAlgorithmStep = () => {
  const handlers = getAlgorithmHandlers();
  handlers.calculateStep();
  store.dispatch(incrementIterations());
};
