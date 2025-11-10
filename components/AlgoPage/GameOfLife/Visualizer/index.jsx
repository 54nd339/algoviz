import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch, batch } from "react-redux";
import { 
  setGrid, 
  toggleCell, 
  incrementGeneration, 
  setAliveCells, 
  incrementTotalIterations,
  setIsRunning 
} from "@/redux/reducers/gameOfLifeSlice";
import { computeNextGeneration, countAliveCells } from "../GameOfLifeUtils/algorithms";
import TopBar from "@/components/TopBar";

const Visualizer = () => {
  const dispatch = useDispatch();
  const grid = useSelector((state) => state.gameOfLife.grid);
  const isRunning = useSelector((state) => state.gameOfLife.isRunning);
  const isDrawMode = useSelector((state) => state.gameOfLife.isDrawMode);
  const speed = useSelector((state) => state.gameOfLife.speed);
  const generation = useSelector((state) => state.gameOfLife.generation);
  const gridSize = useSelector((state) => state.gameOfLife.gridSize);
  const cellSize = useSelector((state) => state.gameOfLife.cellSize);
  
  const simulationRef = useRef();
  const isMouseDown = useRef(false);

  // Handle simulation loop
  useEffect(() => {
    if (isRunning && grid) {
      simulationRef.current = setInterval(() => {
        const nextGen = computeNextGeneration(grid);
        const aliveCount = countAliveCells(nextGen);

        batch(() => {
          dispatch(setGrid(nextGen));
          dispatch(incrementGeneration());
          dispatch(setAliveCells(aliveCount));
          dispatch(incrementTotalIterations());
        });
      }, speed);

      return () => {
        if (simulationRef.current) {
          clearInterval(simulationRef.current);
        }
      };
    }
  }, [isRunning, grid, speed, dispatch]);

  const handleCellClick = (row, col) => {
    if (!isRunning && (isDrawMode || !grid)) {
      dispatch(toggleCell({ row, col }));
    }
  };

  const handleMouseDown = () => {
    isMouseDown.current = true;
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  const handleMouseEnter = (row, col) => {
    if (isMouseDown.current && !isRunning && (isDrawMode || !grid)) {
      dispatch(toggleCell({ row, col }));
    }
  };

  if (!grid) {
    return (
      <div className="relative w-full min-h-[60vh] border-[1px] border-border-1 bg-graphPattern select-none">
        <TopBar />
        <div className="min-h-[50vh] py-[2rem] flex justify-center items-center">
          <div className="text-text-3 font-space uppercase tracking-[0.1em]">
            Generate a pattern to begin
          </div>
        </div>
      </div>
    );
  }

  const canvasSize = Math.min(gridSize * cellSize, 500);
  const adjustedCellSize = canvasSize / gridSize;

  return (
    <div className="relative w-full min-h-[60vh] border-[1px] border-border-1 select-none overflow-auto py-gap">
      <TopBar />

      <div className="flex flex-col justify-center items-center gap-gap w-full relative">
        {/* Generation Counter & Grid Size */}
        <div className="flex gap-gap text-text-1 font-space text-sm md:text-base">
          <div>
            Generation: <span className="text-green">{generation}</span>
          </div>
          <div>
            Grid Size: <span className="text-purple">{gridSize}×{gridSize}</span>
          </div>
        </div>

        {/* Grid */}
        <div
          className="relative border-[2px] border-green bg-bg-3"
          style={{
            width: canvasSize,
            height: canvasSize,
            cursor: isDrawMode ? "crosshair" : "default",
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                onClick={() => handleCellClick(i, j)}
                onMouseEnter={() => handleMouseEnter(i, j)}
                className={`absolute transition-all ${
                  cell === 1 ? "bg-green" : "bg-bg-3"
                } ${
                  isDrawMode && !isRunning
                    ? "hover:bg-green hover:opacity-75"
                    : "cursor-default"
                }`}
                style={{
                  left: j * adjustedCellSize,
                  top: i * adjustedCellSize,
                  width: adjustedCellSize,
                  height: adjustedCellSize,
                  border: "1px solid rgba(100, 200, 100, 0.1)",
                }}
              />
            ))
          )}
        </div>

        {/* Info */}
        {isDrawMode && !isRunning && (
          <div className="text-text-3 font-space text-xs md:text-sm">
            Click cells to toggle. Press Play to start simulation.
          </div>
        )}
      </div>
    </div>
  );
};

export default Visualizer;
