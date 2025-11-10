import { useDispatch, useSelector } from "react-redux";
import { setIsRunning, setSolutions, setCurrentSolution, setTotalSolutions, setIsComplete, setMessage } from "@/redux/reducers/nQueenSlice";

import { solveNQueens } from "../NQueenUtils/algorithms";
import { setBoard } from "@/redux/reducers/nQueenSlice";

const SolveButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.nQueen.isRunning);
  const boardSize = useSelector((state) => state.nQueen.boardSize);
  const speed = useSelector((state) => state.nQueen.speed);

  const handleSolve = async () => {
    if (isRunning) {
      dispatch(setIsRunning(false));
      return;
    }

    dispatch(setIsRunning(true));
    dispatch(setMessage("Solving..."));

    const onUpdate = async (board, row, solutionCount, isComplete) => {
      dispatch(setBoard(board));
      await new Promise((resolve) => setTimeout(resolve, 601 - speed));
    };

    try {
      const solutions = await solveNQueens(boardSize, onUpdate);
      dispatch(setSolutions(solutions));
      dispatch(setTotalSolutions(solutions.length));
      dispatch(setCurrentSolution(0));
      
      if (solutions.length > 0) {
        dispatch(setBoard(solutions[0]));
        dispatch(setIsComplete(true));
      } else {
        dispatch(setMessage("No solutions found!"));
      }
    } catch (error) {
      console.error("Error solving N-Queens:", error);
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
