import BranchingController from "./BranchingController";
import DepthController from "./DepthController";
import GenerateButton from "./GenerateButton";
import SpeedController from "./SpeedController";
import StartButton from "./StartButton";

const MinimaxControllers = () => {
  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none">
      <GenerateButton />
      <SpeedController />
      <DepthController />
      <BranchingController />
      <StartButton />
    </div>
  );
};

export default MinimaxControllers;

