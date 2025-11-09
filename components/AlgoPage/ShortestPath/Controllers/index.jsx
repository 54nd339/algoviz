import React from "react";
import GenerateButton from "./GenerateButton";
import SpeedController from "@/components/AlgoPage/MinSpanTree/Controllers/SpeedController";
import CountController from "@/components/AlgoPage/MinSpanTree/Controllers/CountController";
import SourceNodeSelector from "./SourceNodeSelector";
import StartButton from "./StartButton";

const ShortestPathControllers = () => {
  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none">
      <GenerateButton />
      <SpeedController />
      <CountController />
      <SourceNodeSelector />
      <StartButton />
    </div>
  );
};

export default ShortestPathControllers;
