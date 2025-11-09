import { MakeDelay } from "@/utils";
import { store } from "@/redux/store";
import {
  setNetwork,
  incrementEpoch,
  setLoss,
  setAccuracy,
  addToHistory,
  setCurrentInput,
  setCurrentOutput,
  setIsRunning,
  setStatus,
  resetMetrics,
} from "@/redux/reducers/perceptronSlice";

// Activation functions
const sigmoid = (x) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
const sigmoid_derivative = (x) => {
  // x is the pre-activation value (z)
  const sig = sigmoid(x);
  return sig * (1 - sig);
};

const relu = (x) => Math.max(0, x);
const relu_derivative = (x) => (x > 0 ? 1 : 0);

const tanh = (x) => Math.tanh(Math.max(-500, Math.min(500, x)));
const tanh_derivative = (x) => {
  // x is the pre-activation value (z)
  const t = tanh(x);
  return 1 - t * t;
};

const none = (x) => x;
const none_derivative = (x) => 1;

// Get activation function by name
const getActivationFunction = (name) => {
  switch (name) {
    case "sigmoid":
      return sigmoid;
    case "tanh":
      return tanh;
    case "none":
      return none;
    case "relu":
    default:
      return relu;
  }
};

const getActivationDerivative = (name) => {
  switch (name) {
    case "sigmoid":
      return sigmoid_derivative;
    case "tanh":
      return tanh_derivative;
    case "none":
      return none_derivative;
    case "relu":
    default:
      return relu_derivative;
  }
};

// Initialize network
export const initializeNetwork = (inputSize, layers, neuronsPerLayer) => {
  const network = [];
  let prevSize = inputSize;

  for (let i = 0; i < layers; i++) {
    const currentSize = i === layers - 1 ? 1 : neuronsPerLayer;
    const layer = {
      id: i,
      neurons: [],
      weights: [],
      biases: [],
      z_values: [],
      a_values: [],
    };

    // Initialize neurons
    for (let j = 0; j < currentSize; j++) {
      layer.neurons.push({
        id: `${i}-${j}`,
        value: 0,
        delta: 0,
      });
      layer.biases.push(Math.random() * 0.1 - 0.05);
    }

    // Initialize weights
    for (let j = 0; j < currentSize; j++) {
      layer.weights[j] = [];
      for (let k = 0; k < prevSize; k++) {
        layer.weights[j].push(Math.random() * 0.2 - 0.1);
      }
    }

    network.push(layer);
    prevSize = currentSize;
  }

  return network;
};

// Forward pass
const forward = (network, input, activationFunctionName = "relu") => {
  let activation = input;
  const activationFn = getActivationFunction(activationFunctionName);

  for (let i = 0; i < network.length; i++) {
    const layer = network[i];
    const z_values = [];
    const a_values = [];

    for (let j = 0; j < layer.neurons.length; j++) {
      let z = layer.biases[j];

      for (let k = 0; k < activation.length; k++) {
        z += layer.weights[j][k] * activation[k];
      }

      z_values.push(z);

      // Use selected activation for all layers
      const a = activationFn(z);
      a_values.push(a);

      layer.neurons[j].value = a;
    }

    layer.z_values = z_values;
    layer.a_values = a_values;
    activation = a_values;
  }

  return activation[0];
};

// Backward pass
const backward = (network, input, target, learningRate, activationFunctionName = "relu") => {
  const activationDerivativeFn = getActivationDerivative(activationFunctionName);
  const numLayers = network.length;

  // Calculate output layer deltas
  const outputLayer = network[numLayers - 1];
  const output = outputLayer.neurons[0].value;
  const error = output - target;

  // For output layer, use z_value for activation derivative (not the activated value)
  const outputZ = outputLayer.z_values[0];
  outputLayer.neurons[0].delta = error * activationDerivativeFn(outputZ);

  // Backpropagate through hidden layers
  for (let i = numLayers - 2; i >= 0; i--) {
    const layer = network[i];
    const nextLayer = network[i + 1];

    for (let j = 0; j < layer.neurons.length; j++) {
      let delta = 0;

      for (let k = 0; k < nextLayer.neurons.length; k++) {
        delta +=
          nextLayer.weights[k][j] * nextLayer.neurons[k].delta;
      }

      // Use z_value for activation derivative, not the activated value
      const z = layer.z_values[j];
      delta *= activationDerivativeFn(z);

      layer.neurons[j].delta = delta;
    }
  }

  // Update weights and biases
  let prevActivation = input;
  for (let i = 0; i < numLayers; i++) {
    const layer = network[i];

    for (let j = 0; j < layer.neurons.length; j++) {
      for (let k = 0; k < prevActivation.length; k++) {
        layer.weights[j][k] -=
          learningRate *
          layer.neurons[j].delta *
          prevActivation[k];
      }

      layer.biases[j] -=
        learningRate * layer.neurons[j].delta;
    }

    prevActivation = layer.a_values;
  }

  return error;
};

// Generate training data (XOR problem)
export const generateTrainingData = (samples = 100) => {
  const data = [];
  const classes = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ];
  const labels = [0, 1, 1, 0];

  for (let i = 0; i < samples; i++) {
    const classIdx = i % 4;
    const input = classes[classIdx].map((x) => x + (Math.random() - 0.5) * 0.2);
    const label = labels[classIdx];

    data.push({
      input: input,
      label: label,
    });
  }

  return data;
};

// Train network
export const trainNetwork = async () => {
  const state = store.getState().perceptron;

  if (!state.network || state.isRunning) {
    return;
  }

  const network = JSON.parse(JSON.stringify(state.network));
  const trainingData = generateTrainingData(50);
  const epochs = state.totalEpochs;
  const learningRate = state.learningRate;
  const activationFunction = state.activationFunction;

  store.dispatch(resetMetrics());
  store.dispatch(setIsRunning(true));

  try {
    for (let epoch = 0; epoch < epochs; epoch++) {
      const currentState = store.getState().perceptron;
      if (!currentState.isRunning) {
        throw new Error("stopped");
      }

      let totalLoss = 0;
      let correct = 0;

      for (let i = 0; i < trainingData.length; i++) {
        const { input, label } = trainingData[i];

        store.dispatch(setCurrentInput(input));

        const output = forward(network, input, activationFunction);
        store.dispatch(setCurrentOutput(output));

        const error = backward(network, input, label, learningRate, activationFunction);
        totalLoss += error * error;

        const prediction = output > 0.5 ? 1 : 0;
        if (prediction === label) {
          correct += 1;
        }

        await MakeDelay(5);
      }

      const avgLoss = totalLoss / trainingData.length;
      const accuracy = correct / trainingData.length;

      store.dispatch(setLoss(avgLoss));
      store.dispatch(setAccuracy(accuracy));
      store.dispatch(incrementEpoch());
      store.dispatch(
        addToHistory({
          epoch: epoch + 1,
          loss: avgLoss,
          accuracy: accuracy,
        })
      );

      store.dispatch(setNetwork(JSON.parse(JSON.stringify(network))));
      await MakeDelay(state.speed);
    }

    store.dispatch(setStatus("completed"));
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

export default trainNetwork;
