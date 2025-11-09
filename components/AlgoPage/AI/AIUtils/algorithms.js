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
 * KNN ALGORITHM
 */

export const generateKNNData = (count) => {
  const state = store.getState().ai;
  const k = state.k || 2; // Get number of groups from Redux, default to 2
  const points = [];
  const pointsPerGroup = Math.floor(count / k);
  
  // Generate K clusters arranged in a circle
  for (let groupIdx = 0; groupIdx < k; groupIdx++) {
    const angle = (groupIdx / k) * 2 * Math.PI;
    const centerX = 5 * Math.cos(angle);
    const centerY = 5 * Math.sin(angle);
    
    // Generate points for this group
    for (let i = 0; i < pointsPerGroup; i++) {
      const pointAngle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 1.5;
      points.push({
        x: centerX + radius * Math.cos(pointAngle),
        y: centerY + radius * Math.sin(pointAngle),
        class: -1, // All unclassified initially
        trueClass: groupIdx, // Store true group/class for later
      });
    }
  }
  
  // Add remaining points if count is not evenly divisible by k
  const remaining = count - (pointsPerGroup * k);
  for (let i = 0; i < remaining; i++) {
    const groupIdx = i % k;
    const angle = (groupIdx / k) * 2 * Math.PI;
    const centerX = 5 * Math.cos(angle);
    const centerY = 5 * Math.sin(angle);
    const pointAngle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 1.5;
    points.push({
      x: centerX + radius * Math.cos(pointAngle),
      y: centerY + radius * Math.sin(pointAngle),
      class: -1,
      trueClass: groupIdx,
    });
  }
  
  return points;
};

export const calculateKNNStep = () => {
  const state = store.getState().ai;
  const dataPoints = state.dataPoints;
  const k = state.k; // Use K value from Redux
  
  if (dataPoints.length === 0) return;
  
  // Find unclassified points (class === -1)
  const unclassifiedIndices = dataPoints
    .map((point, idx) => point.class === -1 ? idx : -1)
    .filter(idx => idx !== -1);
  
  // Classify one point per step
  if (unclassifiedIndices.length > 0) {
    const pointIdx = unclassifiedIndices[0];
    const point = dataPoints[pointIdx];
    
    // Calculate distances to all other points using their trueClass as the training data
    // Skip points with trueClass === -2 (user-added points without known class)
    const distances = dataPoints
      .map((other, idx) => ({
        distance: Math.sqrt((point.x - other.x) ** 2 + (point.y - other.y) ** 2),
        trueClass: other.trueClass,
        index: idx,
      }))
      .filter(d => d.index !== pointIdx && d.trueClass !== -2) // Exclude self and user-added without class
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
    
    // If no valid neighbors found, skip this point
    if (distances.length === 0) {
      store.dispatch(require("@/redux/reducers/aiSlice").incrementIterations());
      return;
    }
    
    // Majority vote among k nearest neighbors using trueClass
    const votes = distances.reduce((acc, d) => {
      acc[d.trueClass] = (acc[d.trueClass] || 0) + 1;
      return acc;
    }, {});
    
    const predictedClass = Object.keys(votes).length > 0 
      ? Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b)
      : 0;
    
    // Create new array with updated point (immutable)
    const updatedDataPoints = dataPoints.map((p, idx) => 
      idx === pointIdx 
        ? { ...p, class: parseInt(predictedClass) }
        : p
    );
    
    // Dispatch updated points
    store.dispatch(require("@/redux/reducers/aiSlice").setDataPoints(updatedDataPoints));
  }
  
  // Calculate accuracy based on current predictions
  let correctPredictions = 0;
  let classifiedCount = 0;
  dataPoints.forEach((point) => {
    if (point.class !== -1 && point.trueClass !== -2) { // Only count original and generated points
      classifiedCount++;
      if (point.class === point.trueClass) {
        correctPredictions++;
      }
    }
  });
  
  const accuracy = classifiedCount > 0 ? (correctPredictions / classifiedCount) * 100 : 0;
  
  // Update Redux with KNN metrics
  store.dispatch(require("@/redux/reducers/aiSlice").setRSquared(accuracy / 100));
  store.dispatch(require("@/redux/reducers/aiSlice").setMSE(100 - accuracy));
  store.dispatch(require("@/redux/reducers/aiSlice").setSlope(k));
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
