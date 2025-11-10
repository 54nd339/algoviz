import { useDispatch, useSelector } from "react-redux";
import { setIsRunning, setMessage, setTotalAttempts } from "@/redux/reducers/nQueenSlice";
import { setSolutions, setTotalSolutions, setCurrentSolution, setBoard, setIsComplete } from "@/redux/reducers/nQueenSlice";
import { solveNQueens } from "../NQueenUtils/algorithms";
import { setStopped, getStopped } from "./stopFlag";

const SolveButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.nQueen.isRunning);
  const boardSize = useSelector((state) => state.nQueen.boardSize);
  const speed = useSelector((state) => state.nQueen.speed);

  const handleSolve = async () => {
    if (isRunning) {
      setStopped(true);
      dispatch(setIsRunning(false));
      return;
    }

    setStopped(false);
    dispatch(setIsRunning(true));
    dispatch(setMessage("Solving..."));
    dispatch(setTotalAttempts(0));

    const onUpdate = async (board, row, totalAttempts, isComplete) => {
      if (board) {
        dispatch(setBoard(board));
      }
      dispatch(setTotalAttempts(totalAttempts));
      await new Promise((resolve) => setTimeout(resolve, 601 - speed));
    };

    try {
      const solutions = await solveNQueens(boardSize, onUpdate, getStopped);
      
      if (getStopped()) {
        dispatch(setMessage("Stopped"));
        return;
      }

      if (solutions && solutions.length > 0) {
        dispatch(setSolutions(solutions));
        dispatch(setTotalSolutions(solutions.length));
        dispatch(setCurrentSolution(0));
        dispatch(setBoard(solutions[0]));
        dispatch(setIsComplete(true));
        dispatch(setMessage(`Found ${solutions.length} solution(s)!`));
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
