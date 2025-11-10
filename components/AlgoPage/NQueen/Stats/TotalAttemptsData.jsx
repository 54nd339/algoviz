import React from "react";
import { useSelector } from "react-redux";

const TotalAttemptsData = () => {
  const totalAttempts = useSelector((state) => state.nQueen.totalAttempts);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-cyan text-[1.1rem] tracking-wide">
        Total Attempts
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Placements Tried
          <span className="text-cyan">{totalAttempts}</span>
        </span>
      </div>
    </div>
  );
};

export default TotalAttemptsData;
