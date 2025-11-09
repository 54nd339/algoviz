import React from "react";
import GenerateButton from "./GenerateButton";
import StartButton from "./StartButton";
import CountController from "./CountController";
import SpeedController from "./SpeedController";

export default function GraphTraversalControllers() {
  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none">
      <GenerateButton />
      <SpeedController />
      <CountController />
      <StartButton />
    </div>
  );
}
