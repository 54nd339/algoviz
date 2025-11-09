import { useDispatch, useSelector } from "react-redux";
import { setBoard, setOriginalBoard, resetMetrics, setUserInputMode } from "@/redux/reducers/sudokuSlice";
import { generateSudokuPuzzle } from "../SudokuUtils/algorithms";

const GenerateButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.sudoku.isRunning);
  const boardSize = useSelector((state) => state.sudoku.boardSize);

  const handleGenerate = async () => {
    if (!isRunning) {
      try {
        // generateSudokuPuzzle is now async
        const puzzle = await generateSudokuPuzzle("medium", boardSize);
        dispatch(setOriginalBoard(JSON.parse(JSON.stringify(puzzle))));
        dispatch(setBoard(JSON.parse(JSON.stringify(puzzle))));
        dispatch(setUserInputMode(false)); // Exit manual input mode
        dispatch(resetMetrics());
      } catch (error) {
        console.error("Error generating puzzle:", error);
      }
    }
  };

  return (
    <div
      className="relative w-full h-full lg:max-w-[250px] bg-blue-bg flex justify-center items-center text-text-1 font-space uppercase select-none border-l-[10px] border-blue text-[1rem] md:text-lg hover:cursor-pointer hover:bg-blue hover:text-bg-1 leading-[105%]"
      onClick={handleGenerate}
      style={{ opacity: isRunning ? 0.5 : 1, pointerEvents: isRunning ? "none" : "auto" }}
    >
      Generate Puzzle
    </div>
  );
};

export default GenerateButton;
