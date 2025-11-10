import { useEffect } from "react";
import { batch, useDispatch } from "react-redux";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import GameOfLifeControllers from "@/components/AlgoPage/GameOfLife/Controllers";
import GameOfLifeVisualizer from "@/components/AlgoPage/GameOfLife/Visualizer";
import GameOfLifeStats from "@/components/AlgoPage/GameOfLife/Stats";
import { AlgoData } from "@/components/Shared";
import { setAlgoName, setAlgoId, setAlgoCategory } from "@/redux/reducers/pageSlice";
import { initializeEmptyGrid } from "@/components/AlgoPage/GameOfLife/GameOfLifeUtils/algorithms";
import { setGrid } from "@/redux/reducers/gameOfLifeSlice";
import { ToProperCase } from "@/utils";

export default function GameOfLifePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    const rawAlgoId = 'game-of-life';
    const algoName = ToProperCase(rawAlgoId);
    batch(() => {
      dispatch(setAlgoId(rawAlgoId));
      dispatch(setAlgoName(algoName));
      dispatch(setAlgoCategory("others"));
    });
    
    // Initialize with empty grid
    const initialGrid = initializeEmptyGrid(50);
    dispatch(setGrid(initialGrid));
  }, [dispatch]);

  return (
    <div>
      <Seo category="others" id="game-of-life" />
      <div className="px-gap">
        <GameOfLifeControllers />
        <GameOfLifeVisualizer />
        <GameOfLifeStats />
        <AlgoData />
        <Footer />
      </div>
    </div>
  );
}
