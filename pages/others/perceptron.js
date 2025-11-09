import { batch } from "react-redux";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import Seo from "@/components/Seo";
import { ToProperCase } from "@/utils";
import Footer from "@/components/Footer";
import { setIsRunning, setNetwork, setCurrentInput, setCurrentOutput } from "@/redux/reducers/perceptronSlice";
import {
  setAlgoId,
  setAlgoName,
  setAlgoCategory,
} from "@/redux/reducers/pageSlice";
import PerceptronControllers from "@/components/AlgoPage/Perceptron/Controllers";
import VisualizerContainer from "@/components/AlgoPage/Perceptron/Visualizer";
import StatsContainer from "@/components/AlgoPage/Perceptron/Stats";
import AlgoData from "@/components/AlgoPage/Perceptron/AlgoData";
import { initializeNetwork } from "@/components/AlgoPage/Perceptron/PerceptronUtils/algorithms";

// Forward pass function for initial visualization
const computeForwardPass = (network, input) => {
  let activation = [...input];
  const relu = (x) => Math.max(0, x);

  // Create a deep copy of the network to modify
  const workingNetwork = JSON.parse(JSON.stringify(network));

  for (let i = 0; i < workingNetwork.length; i++) {
    const layer = workingNetwork[i];
    const nextActivation = [];
    
    for (let j = 0; j < layer.neurons.length; j++) {
      let z = layer.biases[j];
      for (let k = 0; k < activation.length; k++) {
        z += layer.weights[j][k] * activation[k];
      }
      const a = relu(z);
      nextActivation.push(a);
      layer.neurons[j].value = a;
    }
    activation = nextActivation;
  }

  return { network: workingNetwork, output: activation[0] };
};

const PerceptronPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const rawAlgoId = "perceptron";
    const algoName = ToProperCase(rawAlgoId);

    dispatch(setIsRunning(false));
    const network = initializeNetwork(2, 3, 5);
    
    // Compute forward pass to get real neuron values
    const initialInput = [0.5, 0.5];
    const { network: networkWithActivations, output } = computeForwardPass(network, initialInput);
    
    dispatch(setNetwork(networkWithActivations));
    dispatch(setCurrentInput(initialInput));
    dispatch(setCurrentOutput(output));

    if (algoName) {
      batch(() => {
        dispatch(setAlgoId(rawAlgoId));
        dispatch(setAlgoName(algoName));
        dispatch(setAlgoCategory("others"));
      });
    }
  }, [dispatch]);

  return (
    <div>
      <Seo category="others" id="perceptron" />
      <div className="px-gap">
        <PerceptronControllers />
        <VisualizerContainer />
        <StatsContainer />
        <AlgoData />
        <Footer />
      </div>
    </div>
  );
};

export default PerceptronPage;
