import { useDispatch, useSelector } from "react-redux";
import { resetTour } from "@/redux/reducers/touringKnightSlice";

import { initializeBoard } from "../TouringKnightUtils/algorithms";
import { setBoard } from "@/redux/reducers/touringKnightSlice";

const ResetButton = () => {
  const dispatch = useDispatch();
  const boardSize = useSelector((state) => state.touringKnight.boardSize);

  const handleReset = () => {
    dispatch(resetTour());
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
