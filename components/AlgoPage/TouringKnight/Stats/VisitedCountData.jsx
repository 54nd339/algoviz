import React from "react";
import { useSelector } from "react-redux";

const VisitedCountData = () => {
  const visitedCount = useSelector((state) => state.touringKnight.visitedCount);
  const boardSize = useSelector((state) => state.touringKnight.boardSize);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Visited Squares
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Visited
          <span className="text-cyan">{visitedCount}</span>
        </span>
        <span className="flex justify-between">
          Total
          <span className="text-purple">{boardSize * boardSize}</span>
        </span>
      </div>
    </div>
  );
};

export default VisitedCountData;
