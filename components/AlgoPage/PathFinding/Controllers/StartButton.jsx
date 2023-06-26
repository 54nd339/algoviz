import React from "react";
import { batch, useDispatch, useSelector } from "react-redux";
import { store } from "@/redux/store";

import * as Algorithms from "../MazeUtils/algorithms";
import generateMaze from "../MazeUtils/generateMaze";
import { setIsFinding, setStatus } from "@/redux/reducers/pathSlice";

const StartButton = () => {
  const algoId = useSelector((state) => state.page.algoId);
  const dispatch = useDispatch();

  const startAlgo = async (algoId) => {
    let visitedInOrder = [];
    dispatch(setIsFinding(true));
    if (algoId === "a-star") {
      visitedInOrder = Algorithms.aStar();
    }
    else if (algoId === "dijkstra") {
      visitedInOrder = Algorithms.dijkstra();
    }
    else if (algoId === "breadth-first-search") {
      visitedInOrder = Algorithms.bfs();
    }
    else if (algoId === "depth-first-search") {
      visitedInOrder = Algorithms.dfs();
    }

    const { grid, finishNode } = store.getState().path;
    const finish = grid[finishNode.x][finishNode.y];
    const shortedPath = Algorithms.getShortestPath(finish);

    for (let i = 0; i < visitedInOrder.length; i++) {
      setTimeout(() => {
        const node = visitedInOrder[i];
        if (!node.isStart && !node.isEnd)
          document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';
      }, store.getState().path.speed * i);
    }
    for (let i = 0; i < shortedPath.length; i++) {
      setTimeout(() => {
        const node = shortedPath[i];
        if (!node.isStart && !node.isEnd)
          document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-path';
      }, store.getState().path.speed * (visitedInOrder.length + i));
    }
    setTimeout(() => {
      batch(() => {
        dispatch(setIsFinding(false));
        dispatch(setStatus("path found"));
      });
    }, store.getState().path.speed * (visitedInOrder.length + shortedPath.length));
  };

  return (<>
    <div
      className="relative w-full h-full lg:max-w-[250px] bg-red-bg flex justify-center items-center text-text-1 font-space uppercase select-none border-l-[10px] border-red text-[1rem] md:text-lg hover:cursor-pointer hover:bg-red hover:text-bg-1 leading-[105%]"
      onClick={() => {
        const { rowCount, colCount } = store.getState().path;
        generateMaze();
        batch(() => {
          dispatch(setIsFinding(false));
          dispatch(setStatus("maze generated"));
        })

        for(let row = 0; row < rowCount; row++){
          for(let col = 0; col < colCount; col++){
            let n = document.getElementById(`node-${row}-${col}`);
            if(n && (n.className === 'node node-visited' || n.className === 'node node-path')){
              n.className = 'node';
            }
          }
        }
      }}
    >
      Generate Maze
    </div>
    <div className="relative w-full h-full lg:max-w-[250px] flex">
      {useSelector((state) => state.path.isFinding) === false ? (
        <div
          className="w-full h-full bg-green-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-green text-[1rem] md:text-lg hover:cursor-pointer hover:bg-green hover:text-bg-1 select-none leading-[105%]"
          onClick={() => {
            startAlgo(algoId);
          }}
        >
          Find Path
        </div>
      ) : (
        <div
          className="w-full h-full bg-red-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-red text-[1rem] md:text-lg  hover:cursor-pointer hover:bg-red hover:text-bg-1 select-none leading-[105%]"
        >
          Finding Path
        </div>
      )}
    </div>
  </>);
};

export default StartButton;
