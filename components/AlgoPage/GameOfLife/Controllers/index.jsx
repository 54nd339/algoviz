import GenerateButton from "./GenerateButton";
import SpeedController from "./SpeedController";
import GridSizeController from "./GridSizeController";
import DrawModeButton from "./DrawModeButton";
import StartButton from "./StartButton";

const Controllers = () => {
  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none">
      <GenerateButton />
      <SpeedController />
      <GridSizeController />
      <DrawModeButton />
      <StartButton />
    </div>
  );
};

export default Controllers;
