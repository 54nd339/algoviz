import { useDispatch, useSelector } from "react-redux";
import { setDrawMode, setGrid } from "@/redux/reducers/gameOfLifeSlice";
import { initializeEmptyGrid } from "../GameOfLifeUtils/algorithms";

const DrawModeButton = () => {
  const dispatch = useDispatch();
  const isDrawMode = useSelector((state) => state.gameOfLife.isDrawMode);
  const isRunning = useSelector((state) => state.gameOfLife.isRunning);
  const gridSize = useSelector((state) => state.gameOfLife.gridSize);

  const handleToggleDrawMode = () => {
    if (!isRunning) {
      dispatch(setDrawMode(!isDrawMode));
      if (!isDrawMode) {
        // Clear the grid when entering draw mode
        const emptyGrid = initializeEmptyGrid(gridSize);
        dispatch(setGrid(emptyGrid));
      }
    }
  };

  return (
    <div
      className={`w-full h-full flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] text-[1rem] md:text-lg hover:cursor-pointer select-none leading-[105%] transition-all ${
        isDrawMode
          ? "bg-yellow hover:bg-yellow hover:text-bg-1 border-yellow text-bg-1"
          : "bg-yellow-bg hover:bg-yellow hover:text-bg-1 border-yellow"
      }`}
      onClick={handleToggleDrawMode}
    >
      {isDrawMode ? "✓ Draw Mode" : "Draw Mode"}
    </div>
  );
};

export default DrawModeButton;
