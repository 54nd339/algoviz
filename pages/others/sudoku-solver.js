import { useEffect } from "react";
import { useDispatch, useSelector, batch } from "react-redux";

import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import SudokuControllers from "@/components/AlgoPage/SudokuSolver/Controllers";
import VisualizerContainer from "@/components/AlgoPage/SudokuSolver/Visualizer";
import StatsContainer from "@/components/AlgoPage/SudokuSolver/Stats";
import { AlgoData } from "@/components/Shared";
import { setBoard, setOriginalBoard } from "@/redux/reducers/sudokuSlice";
import { setAlgoName, setAlgoId, setAlgoCategory } from "@/redux/reducers/pageSlice";
import { generateSudokuPuzzle } from "@/components/AlgoPage/SudokuSolver/SudokuUtils/algorithms";
import { ToProperCase } from "@/utils";

export default function SudokuPage() {
  const dispatch = useDispatch();
  const boardSize = useSelector((state) => state.sudoku.boardSize);

  useEffect(() => {
    const rawAlgoId = 'sudoku-solver';
    const algoName = ToProperCase(rawAlgoId);

    // Initialize with a puzzle on page load (async)
    batch(() => {
      dispatch(setAlgoId(rawAlgoId));
      dispatch(setAlgoName(algoName));
      dispatch(setAlgoCategory("others"));
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
      <Seo category="others" id="sudoku" />
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
