import { useDispatch, useSelector } from "react-redux";
import { setIsRunning, resetMetrics } from "@/redux/reducers/gameOfLifeSlice";
import { computeNextGeneration, countAliveCells } from "../GameOfLifeUtils/algorithms";

const StartButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.gameOfLife.isRunning);
  const grid = useSelector((state) => state.gameOfLife.grid);
  const speed = useSelector((state) => state.gameOfLife.speed);

  let simulationInterval;

  const handleStart = () => {
    if (!isRunning && grid) {
      dispatch(setIsRunning(true));
      dispatch(resetMetrics());

      simulationInterval = setInterval(() => {
        const currentGrid = document.gameOfLifeGrid;
        if (currentGrid) {
          const nextGen = computeNextGeneration(currentGrid);
          const aliveCount = countAliveCells(nextGen);
          document.gameOfLifeGrid = nextGen;
          // Dispatch updates will be handled by the Visualizer component
        }
      }, speed);
    }
  };

  const handleStop = () => {
    if (isRunning) {
      dispatch(setIsRunning(false));
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    }
  };

  return (
    <div className="relative w-full h-full lg:max-w-[250px] flex">
      {isRunning ? (
        <div
          className="w-full h-full bg-red-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-red text-[1rem] md:text-lg hover:cursor-pointer hover:bg-red hover:text-bg-1 select-none leading-[105%]"
          onClick={handleStop}
        >
          Pause
        </div>
      ) : (
        <div
          className={`w-full h-full bg-green-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-green text-[1rem] md:text-lg hover:cursor-pointer hover:bg-green hover:text-bg-1 select-none leading-[105%]`}
          onClick={handleStart}
        >
          Play
        </div>
      )}
    </div>
  );
};

export default StartButton;
