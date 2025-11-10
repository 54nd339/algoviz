import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentSolution } from "@/redux/reducers/nQueenSlice";
import { initializeBoard } from "../NQueenUtils/algorithms";
import { setBoard } from "@/redux/reducers/nQueenSlice";
import TopBar from "@/components/TopBar";

const Visualizer = () => {
  const dispatch = useDispatch();
  const board = useSelector((state) => state.nQueen.board);
  const isRunning = useSelector((state) => state.nQueen.isRunning);
  const boardSize = useSelector((state) => state.nQueen.boardSize);
  const solutions = useSelector((state) => state.nQueen.solutions);
  const currentSolution = useSelector((state) => state.nQueen.currentSolution);
  const totalSolutions = useSelector((state) => state.nQueen.totalSolutions);
  const isComplete = useSelector((state) => state.nQueen.isComplete);

  useEffect(() => {
    if (!board) {
      const newBoard = initializeBoard(boardSize);
      dispatch(setBoard(newBoard));
    }
  }, [board, dispatch, boardSize]);

  const handleNextSolution = () => {
    if (isComplete && currentSolution < totalSolutions - 1) {
      const nextIdx = currentSolution + 1;
      dispatch(setCurrentSolution(nextIdx));
      dispatch(setBoard(solutions[nextIdx]));
    }
  };

  const handlePrevSolution = () => {
    if (isComplete && currentSolution > 0) {
      const prevIdx = currentSolution - 1;
      dispatch(setCurrentSolution(prevIdx));
      dispatch(setBoard(solutions[prevIdx]));
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

  const canvasSize = Math.min(boardSize * 50, 400);
  const cellSize = canvasSize / boardSize;

  return (
    <div className="relative w-full min-h-[60vh] border-[1px] border-border-1 select-none overflow-auto py-gap">
      <TopBar />

      <div className="flex flex-col justify-center items-center gap-gap w-full relative">
        {/* Info */}
        <div className="flex gap-gap text-text-1 font-space text-sm md:text-base">
          <div>
            N: <span className="text-purple">{boardSize}</span>
          </div>
          {isComplete && (
            <div>
              Solutions: <span className="text-green">{totalSolutions}</span>
            </div>
          )}
        </div>

        {/* Board */}
        <div
          className="relative border-[2px] border-purple bg-bg-3"
          style={{
            width: canvasSize,
            height: canvasSize,
            display: "grid",
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
            gap: "1px",
          }}
        >
          {board.map((row, i) =>
            row.map((hasQueen, j) => (
              <div
                key={`${i}-${j}`}
                className={`transition-colors ${
                  (i + j) % 2 === 0 ? "bg-bg-2" : "bg-bg-3"
                } ${hasQueen ? "bg-yellow" : ""} flex items-center justify-center`}
                style={{
                  width: cellSize - 1,
                  height: cellSize - 1,
                }}
              >
                {hasQueen && (
                  <div className="text-xl font-bold text-bg-1">♛</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Navigation */}
        {isComplete && totalSolutions > 1 && (
          <div className="flex items-center gap-4 mt-gap">
            <div
              onClick={handlePrevSolution}
              disabled={currentSolution === 0}
              className={`px-[2rem] py-2 font-space font-semibold text-lg uppercase border-l-[10px] border-cyan bg-cyan-bg hover:cursor-pointer select-none leading-[105%] transition-all ${
                currentSolution === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-cyan hover:text-bg-1"
              }`}
            >
              ← Previous
            </div>
            <span className="text-text-1 font-space text-lg font-semibold">
              {currentSolution + 1} / {totalSolutions}
            </span>
            <div
              onClick={handleNextSolution}
              disabled={currentSolution === totalSolutions - 1}
              className={`px-[2rem] py-2 font-space font-semibold text-lg uppercase border-l-[10px] border-cyan bg-cyan-bg hover:cursor-pointer select-none leading-[105%] transition-all ${
                currentSolution === totalSolutions - 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-cyan hover:text-bg-1"
              }`}
            >
              Next →
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Visualizer;
