import { useEffect } from "react";
import { batch, useDispatch } from "react-redux";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import TouringKnightControllers from "@/components/AlgoPage/TouringKnight/Controllers";
import TouringKnightVisualizer from "@/components/AlgoPage/TouringKnight/Visualizer";
import TouringKnightStats from "@/components/AlgoPage/TouringKnight/Stats";
import { AlgoData } from "@/components/Shared";
import { setAlgoName, setAlgoId, setAlgoCategory } from "@/redux/reducers/pageSlice";
import { initializeBoard } from "@/components/AlgoPage/TouringKnight/TouringKnightUtils/algorithms";
import { setBoard } from "@/redux/reducers/touringKnightSlice";
import { ToProperCase } from "@/utils";

export default function TouringKnightPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    const rawAlgoId = 'touring-knight';
    const algoName = ToProperCase(rawAlgoId);

    batch(() => {
      dispatch(setAlgoId(rawAlgoId));
      dispatch(setAlgoName(algoName));
      dispatch(setAlgoCategory("others"));
    });
    const initialBoard = initializeBoard(8);
    dispatch(setBoard(initialBoard));
  }, [dispatch]);

  return (
    <div>
      <Seo category="others" id="touring-knight" />
      <div className="px-gap">
        <TouringKnightControllers />
        <TouringKnightVisualizer />
        <TouringKnightStats />
        <AlgoData />
        <Footer />
      </div>
    </div>
  );
}
