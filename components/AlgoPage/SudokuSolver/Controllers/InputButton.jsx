import { useDispatch, useSelector } from "react-redux";
import { setUserInputMode, setUserBoard, setBoard, setOriginalBoard } from "@/redux/reducers/sudokuSlice";

const InputButton = () => {
  const dispatch = useDispatch();
  const isRunning = useSelector((state) => state.sudoku.isRunning);
  const boardSize = useSelector((state) => state.sudoku.boardSize);
  const isUserInputMode = useSelector((state) => state.sudoku.isUserInputMode);
  const userBoard = useSelector((state) => state.sudoku.userBoard);

  const handleInputMode = () => {
    if (isRunning) return;

    if (isUserInputMode) {
      // Exit input mode and save the puzzle
      dispatch(setBoard(JSON.parse(JSON.stringify(userBoard))));
      dispatch(setOriginalBoard(JSON.parse(JSON.stringify(userBoard))));
      dispatch(setUserInputMode(false));
    } else {
      // Enter input mode
      const emptyBoard = Array(boardSize)
        .fill(null)
        .map(() => Array(boardSize).fill(0));
      dispatch(setUserBoard(emptyBoard));
      dispatch(setUserInputMode(true));
    }
  };

  const buttonText = isUserInputMode ? "Done" : "Input Puzzle";
  const buttonColor = isUserInputMode ? "bg-green" : "bg-yellow-bg";
  const buttonBorder = isUserInputMode ? "border-green" : "border-yellow";

  return (
    <div
      className={`hidden w-full h-full px-[2rem] lg:flex gap-[1.5rem] justify-center items-center text-text-1 font-space uppercase border-l-[10px] ${buttonBorder} text-lg hover:cursor-pointer select-none transition ${buttonColor}`}
      onClick={handleInputMode}
      style={{ opacity: isRunning ? 0.5 : 1, pointerEvents: isRunning ? "none" : "auto" }}
    >
      {buttonText}
    </div>
  );
};

export default InputButton;
