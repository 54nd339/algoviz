import React from "react";
import generateGrid from "../MazeUtils/generateGrid";

export default function ResetGrid() {
  return (
    <div
      className="relative w-full h-full lg:max-w-[250px] bg-red-bg flex justify-center items-center text-text-1 font-space uppercase select-none border-l-[10px] border-red text-[1rem] md:text-lg hover:cursor-pointer hover:bg-red hover:text-bg-1 leading-[105%]"
      onClick={() => {
        generateGrid(true)
      }}
    >
      Reset
    </div>
  );
};