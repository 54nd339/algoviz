import { useSelector } from "react-redux";

import { runMinimax } from "../MinimaxUtils/algorithms";

const StartButton = () => {
  const isRunning = useSelector((state) => state.minimax.isRunning);

  return (
    <div className="relative w-full h-full lg:max-w-[220px] flex">
      {isRunning ? (
        <div className="w-full h-full bg-red-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-red text-[1rem] md:text-lg select-none leading-[105%]">
          Running...
        </div>
      ) : (
        <div
          className="w-full h-full bg-green-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-green text-[1rem] md:text-lg hover:cursor-pointer hover:bg-green hover:text-bg-1 select-none leading-[105%]"
          onClick={() => {
            runMinimax();
          }}
        >
          Run Minimax
        </div>
      )}
    </div>
  );
};

export default StartButton;

