import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setStartPosition, setBoard } from "@/redux/reducers/touringKnightSlice";
import { initializeBoard } from "../TouringKnightUtils/algorithms";
import TopBar from "@/components/TopBar";

const Visualizer = () => {
  const dispatch = useDispatch();
  const board = useSelector((state) => state.touringKnight.board);
  const isRunning = useSelector((state) => state.touringKnight.isRunning);
  const boardSize = useSelector((state) => state.touringKnight.boardSize);
  const startRow = useSelector((state) => state.touringKnight.startRow);
  const startCol = useSelector((state) => state.touringKnight.startCol);
  const isComplete = useSelector((state) => state.touringKnight.isComplete);
  const visitedCount = useSelector((state) => state.touringKnight.visitedCount);

  useEffect(() => {
    if (!board) {
      const newBoard = initializeBoard(boardSize);
      dispatch(setBoard(newBoard));
    }
  }, [board, dispatch, boardSize]);

  const handleCellClick = (row, col) => {
    if (!isRunning && !isComplete) {
      dispatch(setStartPosition({ row, col }));
    }
  };

  if (!board) {
    return (
      <div className="relative w-full min-h-[60vh] border-[1px] border-border-1 bg-graphPattern select-none">
        <TopBar />
        <div className="min-h-[50vh] py-[2rem] flex justify-center items-center">
          <div className="text-text-3 font-space uppercase tracking-[0.1em]">
            Loading board...
          </div>
        </div>
      </div>
    );
  }

  const canvasSize = Math.min(boardSize * 50, 500);
  const cellSize = canvasSize / boardSize;

  const getColor = (value, row, col) => {
    if (row === startRow && col === startCol) return "bg-yellow"; // Start position
    if (value === -1) return "bg-bg-3"; // Unvisited
    if (isComplete && value !== -1) {
      return `bg-green/50`;
    }
    if (visitedCount > 0 && value !== -1) return "bg-green/30"; // Currently exploring
    return "bg-bg-3";
  };

  return (
    <div className="relative w-full min-h-[60vh] border-[1px] border-border-1 select-none overflow-auto py-gap">
      <TopBar />

      <div className="flex flex-col justify-center items-center gap-gap w-full relative">
        {/* Info */}
        <div className="flex gap-gap text-text-1 font-space text-sm md:text-base">
          <div>
            Board: <span className="text-yellow">{boardSize}×{boardSize}</span>
          </div>
          <div>
            Visited: <span className="text-green">{visitedCount}/{boardSize * boardSize}</span>
          </div>
          <div>
            Start: <span className="text-cyan">({startRow}, {startCol})</span>
          </div>
        </div>

        {/* Board */}
        <div
          className="relative border-[2px] border-cyan bg-bg-3"
          style={{
            width: canvasSize,
            height: canvasSize,
            cursor: isRunning || isComplete ? "default" : "pointer",
          }}
        >
          {board.map((row, i) =>
            row.map((value, j) => (
              <div
                key={`${i}-${j}`}
                onClick={() => handleCellClick(i, j)}
                className={`absolute transition-colors ${getColor(value, i, j)} ${
                  !isRunning && !isComplete ? "hover:opacity-75" : ""
                }`}
                style={{
                  left: j * cellSize,
                  top: i * cellSize,
                  width: cellSize,
                  height: cellSize,
                  border: "1px solid rgba(100, 200, 200, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: `${Math.max(8, cellSize * 0.4)}px`,
                }}
              >
                {value !== -1 && (
                  <span className="text-text-1 font-mono text-xs font-bold">
                    {value + 1}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        {!isRunning && !isComplete && (
          <div className="text-text-3 font-space text-xs md:text-sm">
            Click on a cell to select starting position, then press Solve
          </div>
        )}
        {isComplete && (
          <div className="text-green font-space text-sm font-semibold">
            ✓ Tour Complete! Press Reset to try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default Visualizer;
