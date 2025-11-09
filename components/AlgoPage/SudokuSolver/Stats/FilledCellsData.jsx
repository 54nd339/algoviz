import { useSelector } from "react-redux";

const FilledCellsData = () => {
  const filledCells = useSelector((state) => state.sudoku.filledCells);
  const boardSize = useSelector((state) => state.sudoku.boardSize);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Progress
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Filled Cells
          <span className="text-blue">{filledCells} / {boardSize * boardSize}</span>
        </span>
      </div>
    </div>
  );
};

export default FilledCellsData;
