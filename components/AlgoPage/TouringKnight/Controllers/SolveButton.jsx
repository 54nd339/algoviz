import { useDispatch, useSelector } from "react-redux";
import { setIsRunning } from "@/redux/reducers/touringKnightSlice";

import { solveKnightTour, getPathVisualization } from "../TouringKnightUtils/algorithms";
import { setBoard, setVisitedCount, setTotalMoves, setIsComplete, setMessage } from "@/redux/reducers/touringKnightSlice";

const SolveButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.touringKnight.isRunning);
  const boardSize = useSelector((state) => state.touringKnight.boardSize);
  const startRow = useSelector((state) => state.touringKnight.startRow);
  const startCol = useSelector((state) => state.touringKnight.startCol);
  const speed = useSelector((state) => state.touringKnight.speed);

  const handleSolve = async () => {
    if (isRunning) {
      dispatch(setIsRunning(false));
      return;
    }

    dispatch(setIsRunning(true));
    dispatch(setMessage("Solving..."));

    const onUpdate = async (board, path, moveCount, isComplete) => {
      dispatch(setVisitedCount(path.length));
      dispatch(setTotalMoves(moveCount));
      if (isComplete) {
        dispatch(setIsComplete(true));
      }
      await new Promise((resolve) => setTimeout(resolve, 601 - speed));
    };

    try {
      const { success, path } = await solveKnightTour(
        boardSize,
        startRow,
        startCol,
        onUpdate
      );

      if (success) {
        const visualization = getPathVisualization(path, boardSize);
        dispatch(setBoard(visualization));
      } else {
        dispatch(setMessage("No solution found!"));
      }
    } catch (error) {
      console.error("Error solving knight tour:", error);
      dispatch(setMessage("Error solving!"));
    }

    dispatch(setIsRunning(false));
  };

  return (
    <div
      className={`w-full h-full flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] text-[1rem] md:text-lg hover:cursor-pointer hover:text-bg-1 select-none leading-[105%] ${
        isRunning
          ? "bg-red-600 border-red-600 hover:bg-red-700 text-white"
          : "bg-green-bg border-green hover:bg-green hover:text-bg-1"
      }`}
      onClick={handleSolve}
    >
      {isRunning ? "Stop" : "Solve"}
    </div>
  );
};

export default SolveButton;
