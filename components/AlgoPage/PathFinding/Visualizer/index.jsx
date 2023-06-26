import React from "react";
import { useSelector } from "react-redux";

import Node from "./Node";
import TopBar from "@/components/TopBar";
import * as mouseControl from "../MazeUtils/mouseControl"

const VisualizerContainer = () => {
  const grid = useSelector((state) => state.path.grid);
  const cellWidth = useSelector((state) => state.path.cellWidth);
  const cellHeight = useSelector((state) => state.path.cellHeight);
  const isMouseDown = useSelector((state) => state.path.isMouseDown);

  return (
    <div className="relative w-full h-[70vh] select-none">
      <TopBar />
      <div
        id="visualizer-container"
        className="h-full w-full border-[3px] border-green"
      >
        {grid.map((row, rowId) => {
          return (
            <div
              key={`grid-row-${rowId}`}
              id={`grid-row-${rowId}`}
              className="flex flex-row"
            >
              {row.map((node, nodeId) => {
                const { row, col, isStart, isEnd, isWall } = node;
                return (
                  <Node
                    key={nodeId}
                    x={row}
                    y={col}
                    width={cellWidth}
                    height={cellHeight}
										isWall={isWall}
										isStart={isStart}
										isFinish={isEnd}                
										mouseIsPressed={isMouseDown}
										onMouseDown={(row, col) => mouseControl.handleMouseDown(row, col)}
										onMouseEnter={(row, col) => mouseControl.handleMouseEnter(row, col)}
										onMouseUp={() => mouseControl.handleMouseUp()}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisualizerContainer;