import { useDispatch, useSelector } from "react-redux";
import { setIsRunning } from "@/redux/reducers/sudokuSlice";
import { solveSudoku } from "../SudokuUtils/algorithms";

const StartButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.sudoku.isRunning);
  const board = useSelector((state) => state.sudoku.board);

  const handleStart = async () => {
    if (!isRunning && board) {
      await solveSudoku();
    }
  };

  const handleStop = () => {
    if (isRunning) {
      dispatch(setIsRunning(false));
    }
  };

  return (
    <div className="relative w-full h-full lg:max-w-[250px] flex">
      {isRunning ? (
        <div
          className="w-full h-full bg-red-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-red text-[1rem] md:text-lg  hover:cursor-pointer hover:bg-red hover:text-bg-1 select-none leading-[105%]"
          onClick={handleStop}
        >
          Stop
        </div>
      ) : (
        <div
          className={`w-full h-full bg-green-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-green text-[1rem] md:text-lg hover:cursor-pointer hover:bg-green hover:text-bg-1 select-none leading-[105%]`}
          onClick={handleStart}
        >
          Solve
        </div>
      )}
    </div>
  );
};

export default StartButton;
