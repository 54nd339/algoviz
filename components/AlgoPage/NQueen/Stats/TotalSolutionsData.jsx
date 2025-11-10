import React from "react";
import { useSelector } from "react-redux";

const TotalSolutionsData = () => {
  const totalSolutions = useSelector((state) => state.nQueen.totalSolutions);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Total Solutions
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Solutions
          <span className="text-cyan">{totalSolutions}</span>
        </span>
      </div>
    </div>
  );
};

export default TotalSolutionsData;
