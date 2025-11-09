import { useDispatch, useSelector } from "react-redux";
import { setIsRunning } from "@/redux/reducers/perceptronSlice";
import { trainNetwork } from "../PerceptronUtils/algorithms";

const StartButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.perceptron.isRunning);
  const network = useSelector((state) => state.perceptron.network);

  const handleStart = async () => {
    if (!isRunning && network) {
      await trainNetwork();
    }
  };

  const handleStop = () => {
    if (isRunning) {
      dispatch(setIsRunning(false));
    }
  };

  return (
    <div className="relative w-full h-full lg:max-w-[220px] flex">
      {isRunning ? (
        <div className="w-full h-full bg-red-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-red text-[1rem] md:text-lg select-none leading-[105%] hover:cursor-pointer"
          onClick={handleStop}
        >
          Stop
        </div>
      ) : (
        <div
          className={`w-full h-full flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] text-[1rem] md:text-lg select-none leading-[105%] ${
            !network
              ? "bg-bg-2 border-border-1 text-text-3 cursor-not-allowed"
              : "bg-green-bg border-green hover:cursor-pointer hover:bg-green hover:text-bg-1"
          }`}
          onClick={handleStart}
        >
          Train Network
        </div>
      )}
    </div>
  );
};

export default StartButton;
