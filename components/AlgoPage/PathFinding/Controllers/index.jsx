import React from "react";

import StartButton from "./StartButton";
import GenerateButton from "./GenerateButton";
import ResetGrid from "./ResetGrid";
import CountController from "./CountSlider";
import SpeedController from "./SpeedSlider";

const MazeGenerationControllers = () => {
  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none">
      <GenerateButton />
      <SpeedController />
      <CountController />
      <StartButton />
      <ResetGrid />
    </div>
  );
};

export default MazeGenerationControllers;
