import { useDispatch, useSelector } from "react-redux";
import { resetSolver } from "@/redux/reducers/nQueenSlice";

import { initializeBoard } from "../NQueenUtils/algorithms";
import { setBoard } from "@/redux/reducers/nQueenSlice";

const ResetButton = () => {
  const dispatch = useDispatch();
  const boardSize = useSelector((state) => state.nQueen.boardSize);

  const handleReset = () => {
    dispatch(resetSolver());
    const newBoard = initializeBoard(boardSize);
    dispatch(setBoard(newBoard));
  };

  return (
    <div
      className="w-full h-full bg-red-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-red text-[1rem] md:text-lg hover:cursor-pointer hover:bg-red hover:text-bg-1 select-none leading-[105%]"
      onClick={handleReset}
    >
      Reset
    </div>
  );
};

export default ResetButton;
