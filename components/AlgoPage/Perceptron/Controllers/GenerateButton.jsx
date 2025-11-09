import { useDispatch, useSelector } from "react-redux";
import { initializeNetwork } from "../PerceptronUtils/algorithms";
import { setNetwork, resetMetrics, setCurrentInput, setCurrentOutput } from "@/redux/reducers/perceptronSlice";

const GenerateButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.perceptron.isRunning);
  const layers = useSelector((state) => state.perceptron.layers);
  const neuronsPerLayer = useSelector(
    (state) => state.perceptron.neuronsPerLayer
  );

  const computeForwardPass = (network, input) => {
    const relu = (x) => Math.max(0, x);
    const workingNetwork = JSON.parse(JSON.stringify(network));
    let activation = [...input];

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

  const handleGenerate = () => {
    if (!isRunning) {
      const network = initializeNetwork(2, layers, neuronsPerLayer);
      const initialInput = [0.5, 0.5];
      const { network: networkWithActivations, output } = computeForwardPass(network, initialInput);
      
      dispatch(setNetwork(networkWithActivations));
      dispatch(setCurrentInput(initialInput));
      dispatch(setCurrentOutput(output));
      dispatch(resetMetrics());
    }
  };

  return (
    <div
      className="relative w-full h-full lg:max-w-[220px] flex"
      onClick={handleGenerate}
    >
      <div
        className={`w-full h-full flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] text-[1rem] md:text-lg select-none leading-[105%] ${
          isRunning
            ? "bg-bg-2 border-border-1 text-text-3 cursor-not-allowed"
            : "bg-blue-bg border-blue hover:cursor-pointer hover:bg-blue hover:text-bg-1"
        }`}
      >
        Generate
      </div>
    </div>
  );
};

export default GenerateButton;
