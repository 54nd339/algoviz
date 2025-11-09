import { useSelector } from "react-redux";
import StartButton from "./StartButton";
import SpeedController from "./SpeedController";
import IterationsController from "./IterationsController";
import LearningRateController from "./LearningRateController";
import GroupsController from "./GroupsController";
import GenerateButton from "./GenerateButton";

export default function AIControllers() {
  const algoId = useSelector((state) => state.page.algoId);

  return (
    <div className="flex flex-row gap-gap py-gap w-full h-[70px] select-none overflow-x-auto">
      <GenerateButton />
      <SpeedController />
      {algoId !== "knn" && <IterationsController />}
      {algoId === "knn" ? <GroupsController /> : <LearningRateController />}
      <StartButton />
    </div>
  );
}
