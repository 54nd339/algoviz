import { useDispatch, useSelector } from "react-redux";
import { setIsRunning, setGrid, resetMetrics } from "@/redux/reducers/gameOfLifeSlice";
import { initializeRandomGrid } from "../GameOfLifeUtils/algorithms";

const GenerateButton = () => {
  const dispatch = useDispatch();
  const gridSize = useSelector((state) => state.gameOfLife.gridSize);
  const isRunning = useSelector((state) => state.gameOfLife.isRunning);

  const handleGenerate = () => {
    if (!isRunning) {
      const newGrid = initializeRandomGrid(gridSize);
      dispatch(resetMetrics());
      dispatch(setGrid(newGrid));
    }
  };

  return (
    <div
      className="relative w-full h-full lg:max-w-[250px] bg-blue-bg flex justify-center items-center text-text-1 font-space uppercase select-none border-l-[10px] border-blue text-[1rem] md:text-lg hover:cursor-pointer hover:bg-blue hover:text-bg-1 leading-[105%]"
      onClick={handleGenerate}
      style={{ opacity: isRunning ? 0.5 : 1, pointerEvents: isRunning ? "none" : "auto" }}
    >
      Generate Random
    </div>
  );
};

export default GenerateButton;
