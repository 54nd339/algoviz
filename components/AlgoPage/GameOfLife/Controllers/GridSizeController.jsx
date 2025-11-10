import { useDispatch, useSelector } from "react-redux";
import { setGridSize, setGrid, resetMetrics } from "@/redux/reducers/gameOfLifeSlice";
import { initializeEmptyGrid } from "../GameOfLifeUtils/algorithms";

const GridSizeController = () => {
  const dispatch = useDispatch();
  const gridSize = useSelector((state) => state.gameOfLife.gridSize);
  const isRunning = useSelector((state) => state.gameOfLife.isRunning);

  const handleChange = (e) => {
    if (!isRunning) {
      const newSize = parseInt(e.target.value);
      dispatch(setGridSize(newSize));
      const newGrid = initializeEmptyGrid(newSize);
      dispatch(resetMetrics());
      dispatch(setGrid(newGrid));
    }
  };

  return (
    <div className="hidden w-[100%] h-full px-[2rem] bg-purple-bg lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-purple text-lg hover:cursor-pointer select-none">
      Grid Size
      <input
        type="range"
        min="10"
        max="100"
        value={gridSize}
        onChange={handleChange}
        disabled={isRunning}
        className="w-[120px] accent-purple cursor-pointer disabled:opacity-50"
      />
    </div>
  );
};

export default GridSizeController;
