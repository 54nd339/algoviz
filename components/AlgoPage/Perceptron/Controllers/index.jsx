import GenerateButton from "./GenerateButton";
import SpeedController from "./SpeedController";
import LayerController from "./LayerController";
import ActivationController from "./ActivationController";
import StartButton from "./StartButton";

const PerceptronControllers = () => {
  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none">
      <GenerateButton />
      <LayerController />
      <ActivationController />
      <SpeedController />
      <StartButton />
    </div>
  );
};

export default PerceptronControllers;
