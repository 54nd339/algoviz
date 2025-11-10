import { useDispatch, useSelector } from "react-redux";
import { setIsRunning, setMessage } from "@/redux/reducers/touringKnightSlice";

import { solveKnightTour, getPathVisualization } from "../TouringKnightUtils/algorithms";
import { setBoard, setVisitedCount, setTotalMoves, setIsComplete } from "@/redux/reducers/touringKnightSlice";
import { setStopped, getStopped } from "./stopFlag";

const SolveButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.touringKnight.isRunning);
  const boardSize = useSelector((state) => state.touringKnight.boardSize);
  const startRow = useSelector((state) => state.touringKnight.startRow);
  const startCol = useSelector((state) => state.touringKnight.startCol);
  const speed = useSelector((state) => state.touringKnight.speed);

  const handleStop = () => {
    setStopped(true);
    dispatch(setIsRunning(false));
  };

  const handleSolve = async () => {
    if (isRunning) {
      handleStop();
      return;
    }

    // Validate start position is set
    if (startRow === undefined || startRow === null || startCol === undefined || startCol === null) {
      dispatch(setMessage("Please select a starting position first!"));
      return;
    }

    setStopped(false);
    dispatch(setIsRunning(true));
    dispatch(setMessage("Solving..."));

    const onUpdate = async (board, path, moveCount, isComplete) => {
      if (getStopped()) return;
      
      // Compute visualization from path to ensure consistent numbering
      const visualization = getPathVisualization(path, boardSize);
      dispatch(setBoard(visualization));
      dispatch(setVisitedCount(path.length));
      dispatch(setTotalMoves(moveCount));
      if (isComplete) {
        dispatch(setIsComplete(true));
        dispatch(setMessage("Tour Complete!"));
      }
      await new Promise((resolve) => setTimeout(resolve, 601 - speed));
    };

    try {
      const { success, path } = await solveKnightTour(
        boardSize,
        startRow,
        startCol,
        onUpdate,
        getStopped
      );

      if (!getStopped()) {
        if (success) {
          const visualization = getPathVisualization(path, boardSize);
          dispatch(setBoard(visualization));
          dispatch(setIsComplete(true));
          dispatch(setMessage("Tour Complete!"));
        } else {
          dispatch(setMessage("No solution found!"));
        }
      }
    } catch (error) {
      console.error("Error solving knight tour:", error);
      if (!getStopped()) {
        dispatch(setMessage("Error solving!"));
      }
    }

    dispatch(setIsRunning(false));
  };

  return (
    <div className="relative w-full h-full lg:max-w-[250px] flex">
      <div
        className={`w-full h-full flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] text-[1rem] md:text-lg hover:cursor-pointer hover:text-bg-1 select-none leading-[105%] ${
          isRunning ? "bg-red-bg border-red hover:bg-red hover:text-bg-1" : "bg-green-bg border-green hover:bg-green hover:text-bg-1"
        }`}
        onClick={handleSolve}
      >
        {isRunning ? "Stop" : "Solve"}
      </div>
    </div>
  );
};

export default SolveButton;
