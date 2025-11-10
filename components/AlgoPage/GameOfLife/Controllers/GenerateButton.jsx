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
      className="w-full h-full bg-cyan-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-cyan text-[1rem] md:text-lg hover:cursor-pointer hover:bg-cyan hover:text-bg-1 select-none leading-[105%] transition-all"
      onClick={handleGenerate}
    >
      Generate
    </div>
  );
};

export default GenerateButton;
