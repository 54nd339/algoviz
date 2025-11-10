import React from "react";
import BoardSizeController from "./BoardSizeController";
import SpeedController from "./SpeedController";
import ResetButton from "./ResetButton";
import SolveButton from "./SolveButton";

const Controllers = () => {
  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none">
      <BoardSizeController />
      <SpeedController />
      <SolveButton />
      <ResetButton />
    </div>
  );
};

export default Controllers;
