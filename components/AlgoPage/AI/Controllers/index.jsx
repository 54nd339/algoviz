import StartButton from "./StartButton";
import SpeedController from "./SpeedController";
import IterationsController from "./IterationsController";
import LearningRateController from "./LearningRateController";
import GenerateButton from "./GenerateButton";

export default function AIControllers() {
  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none overflow-x-auto">
      <GenerateButton />
      <SpeedController />
      <IterationsController />
      <LearningRateController />
      <StartButton />
    </div>
  );
}
