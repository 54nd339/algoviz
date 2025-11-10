import React from "react";
import { useSelector } from "react-redux";

const TotalMovesData = () => {
  const totalMoves = useSelector((state) => state.touringKnight.totalMoves);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Total Moves
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Moves
          <span className="text-cyan">{totalMoves}</span>
        </span>
      </div>
    </div>
  );
};

export default TotalMovesData;
