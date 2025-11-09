import React from "react";
import { batch, useDispatch } from "react-redux";
import { store } from "@/redux/store";

import generateMaze from "../MazeUtils/generateMaze";
import { setIsFinding, setStatus } from "@/redux/reducers/pathSlice";

const GenerateButton = () => {
  const dispatch = useDispatch();

  const handleGenerateMaze = () => {
    const { rowCount, colCount } = store.getState().path;
    generateMaze();
    batch(() => {
      dispatch(setIsFinding(false));
      dispatch(setStatus("maze generated"));
    });

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        let n = document.getElementById(`node-${row}-${col}`);
        if (n && (n.className === 'node node-visited' || n.className === 'node node-path')) {
          n.className = 'node';
        }
      }
    }
  };

  return (
    <div
      className="relative w-full h-full lg:max-w-[250px] bg-blue-bg flex justify-center items-center text-text-1 font-space uppercase select-none border-l-[10px] border-blue text-[1rem] md:text-lg hover:cursor-pointer hover:bg-blue hover:text-bg-1 leading-[105%]"
      onClick={handleGenerateMaze}
    >
      Generate Maze
    </div>
  );
};

export default GenerateButton;
