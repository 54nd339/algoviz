import GenerateButton from "./GenerateButton";
import InputButton from "./InputButton";
import SizeController from "./SizeController";
import SpeedController from "./SpeedController";
import StartButton from "./StartButton";

const Controllers = () => {
  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none">
      <GenerateButton />
      <SpeedController />
      <SizeController />
      <InputButton />
      <StartButton />
    </div>
  );
};

export default Controllers;


