import { useEffect } from "react";
import { useDispatch, useSelector, batch } from "react-redux";

import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import SudokuControllers from "@/components/AlgoPage/SudokuSolver/Controllers";
import VisualizerContainer from "@/components/AlgoPage/SudokuSolver/Visualizer";
import StatsContainer from "@/components/AlgoPage/SudokuSolver/Stats";
import AlgoData from "@/components/AlgoPage/SudokuSolver/AlgoData";
import { setBoard, setOriginalBoard } from "@/redux/reducers/sudokuSlice";
import { setAlgoName } from "@/redux/reducers/pageSlice";
import { generateSudokuPuzzle } from "@/components/AlgoPage/SudokuSolver/SudokuUtils/algorithms";

export default function SudokuPage() {
  const dispatch = useDispatch();
  const boardSize = useSelector((state) => state.sudoku.boardSize);

  useEffect(() => {
    // Initialize with a puzzle on page load (async)
    batch(() => {
      dispatch(setAlgoName("Sudoku Solver"));
    });

    const initializePuzzle = async () => {
      const puzzle = await generateSudokuPuzzle("medium", boardSize);
      dispatch(setOriginalBoard(JSON.parse(JSON.stringify(puzzle))));
      dispatch(setBoard(JSON.parse(JSON.stringify(puzzle))));
    };

    initializePuzzle();
  }, [dispatch, boardSize]);

  return (
    <div>
      <Seo category="others" id="sudoku-solver" />
      <div className="px-gap">
        <SudokuControllers />
        <VisualizerContainer />
        <StatsContainer />
        <AlgoData />
        <Footer />
      </div>
    </div>
  );
}
