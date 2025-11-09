import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCellValue, setBoard, setOriginalBoard, setUserInputMode } from "@/redux/reducers/sudokuSlice";
import TopBar from "@/components/TopBar";

// Convert number to display value (1-9 for standard, 1-9 then A-G for 16x16)
const numToDisplay = (value, boardSize) => {
  if (value === 0) return "";
  if (value <= 9) return value.toString();
  // For 16x16: 10=A, 11=B, ..., 16=G
  return String.fromCharCode(55 + value); // 55+10=65=A
};

// Convert key input to number value (1-9, or A-G for 16x16)
const keyToValue = (key, boardSize) => {
  const numValue = parseInt(key);
  const keyCode = key.toUpperCase().charCodeAt(0);

  // Handle numbers 1-9
  if (!isNaN(numValue) && numValue >= 1 && numValue <= 9 && numValue <= boardSize) {
    return numValue;
  }

  // Handle letters A-G for 16x16
  if (boardSize === 16 && keyCode >= 65 && keyCode <= 71) {
    const letterValue = keyCode - 55; // A=65, 65-55=10
    if (letterValue >= 10 && letterValue <= boardSize) {
      return letterValue;
    }
  }

  return null;
};

const Visualizer = () => {
  const dispatch = useDispatch();
  const board = useSelector((state) => state.sudoku.board);
  const originalBoard = useSelector((state) => state.sudoku.originalBoard);
  const currentCell = useSelector((state) => state.sudoku.currentCell);
  const boardSize = useSelector((state) => state.sudoku.boardSize);
  const isUserInputMode = useSelector((state) => state.sudoku.isUserInputMode);
  const userBoard = useSelector((state) => state.sudoku.userBoard);
  const isRunning = useSelector((state) => state.sudoku.isRunning);
  const [selectedCell, setSelectedCell] = useState(null);

  const displayBoard = isUserInputMode ? userBoard : board;

  // Handle keyboard input for manual entry
  useEffect(() => {
    const handler = (e) => {
      if (!selectedCell || isRunning) return;

      const { row, col } = selectedCell;

      // Allow editing empty cells
      if (originalBoard && originalBoard[row][col] !== 0) {
        return; // Can't edit original cells
      }

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        if (isUserInputMode) {
          dispatch(setCellValue({ row, col, value: 0 }));
        } else {
          // In solver view, just clear selected cell visually
          setSelectedCell(null);
        }
      } else {
        const value = keyToValue(e.key, boardSize);
        if (value !== null) {
          e.preventDefault();
          if (isUserInputMode) {
            dispatch(setCellValue({ row, col, value }));
          }
        }
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        let nextCol = col + 1;
        let nextRow = row;
        if (nextCol >= boardSize) {
          nextCol = 0;
          nextRow += 1;
        }
        if (nextRow < boardSize) {
          setSelectedCell({ row: nextRow, col: nextCol });
        } else {
          setSelectedCell(null);
        }
      }

      // Arrow key navigation
      if (e.key === "ArrowUp" && row > 0) {
        e.preventDefault();
        setSelectedCell({ row: row - 1, col });
      } else if (e.key === "ArrowDown" && row < boardSize - 1) {
        e.preventDefault();
        setSelectedCell({ row: row + 1, col });
      } else if (e.key === "ArrowLeft" && col > 0) {
        e.preventDefault();
        setSelectedCell({ row, col: col - 1 });
      } else if (e.key === "ArrowRight" && col < boardSize - 1) {
        e.preventDefault();
        setSelectedCell({ row, col: col + 1 });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedCell, isUserInputMode, isRunning, boardSize, dispatch, originalBoard]);

  if (!displayBoard) {
    return (
      <div className="relative w-full min-h-[60vh] border-[1px] border-border-1 bg-graphPattern select-none">
        <TopBar />
        <div className="min-h-[50vh] py-[2rem] flex justify-center items-center">
          <div className="text-text-3 font-space uppercase tracking-[0.1em]">
            Generate a puzzle to begin
          </div>
        </div>
      </div>
    );
  }

  const boxSize = Math.sqrt(boardSize);
  const getCellSize = () => {
    if (boardSize <= 4) return 80;
    if (boardSize <= 6) return 60;
    if (boardSize <= 9) return 50;
    return 35; // for 16x16
  };
  const cellSize = getCellSize();

  const handleCellClick = (row, col) => {
    // Allow clicking on any empty cell to select it for editing
    if (!isRunning && (!originalBoard || originalBoard[row][col] === 0)) {
      setSelectedCell({ row, col });
    }
  };

  const handleSolveUserBoard = () => {
    dispatch(setBoard(JSON.parse(JSON.stringify(userBoard))));
    dispatch(setOriginalBoard(JSON.parse(JSON.stringify(userBoard))));
    dispatch(setUserInputMode(false));
  };

  const getInputHint = () => {
    return `1-${boardSize}`;
  };

  return (
    <div className="relative w-full min-h-[60vh] border-[1px] border-border-1 select-none overflow-auto py-gap">
      <TopBar />

      <div className="flex flex-col justify-center items-center gap-gap w-full relative">
        {/* Board Grid */}
        <div className="mx-auto">
          {/* Grid */}
          {displayBoard.map((row, i) => (
            row.map((cell, j) => {
              const isOriginal = originalBoard && originalBoard[i][j] !== 0;
              const isCurrent =
                currentCell && currentCell.row === i && currentCell.col === j;
              const isSelected = selectedCell && selectedCell.row === i && selectedCell.col === j;

              const borderRight =
                (j + 1) % boxSize === 0 && j !== boardSize - 1
                  ? "3px solid rgba(100, 200, 100, 0.8)"
                  : "1px solid rgba(100, 200, 100, 0.3)";
              const borderBottom =
                (i + 1) % boxSize === 0 && i !== boardSize - 1
                  ? "3px solid rgba(100, 200, 100, 0.8)"
                  : "1px solid rgba(100, 200, 100, 0.3)";
              const borderLeft = j === 0 ? "3px solid rgba(100, 200, 100, 0.8)" : "none";
              const borderTop = i === 0 ? "3px solid rgba(100, 200, 100, 0.8)" : "none";

              return (
                <div
                  key={`${i}-${j}`}
                  onClick={() => handleCellClick(i, j)}
                  className={`absolute flex items-center justify-center font-bold select-none transition-all ${
                    !isRunning && (!originalBoard || originalBoard[i][j] === 0) ? "cursor-pointer" : "cursor-default"
                  } ${
                    isOriginal
                      ? "text-text-1 bg-bg-2"
                      : isCurrent
                      ? "text-cyan bg-green bg-opacity-20"
                      : isSelected
                      ? isUserInputMode
                        ? "text-text-1 bg-cyan bg-opacity-50 shadow-lg shadow-cyan/50"
                        : "text-text-1 bg-cyan bg-opacity-30"
                      : isUserInputMode && (!originalBoard || originalBoard[i][j] === 0)
                      ? "text-cyan hover:bg-cyan hover:bg-opacity-20"
                      : "text-cyan hover:bg-cyan hover:bg-opacity-10"
                  }`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    fontSize:
                      cellSize >= 60 ? "1.5rem" : cellSize >= 40 ? "1.2rem" : "0.9rem",
                    left: j * cellSize + Math.floor(j / boxSize) * 2,
                    top: i * cellSize + Math.floor(i / boxSize) * 2,
                    borderRight,
                    borderBottom,
                    borderLeft,
                    borderTop,
                  }}
                >
                  {numToDisplay(cell, boardSize)}
                </div>
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
