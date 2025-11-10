import { useEffect } from "react";
import { batch, useDispatch } from "react-redux";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import NQueenControllers from "@/components/AlgoPage/NQueen/Controllers";
import NQueenVisualizer from "@/components/AlgoPage/NQueen/Visualizer";
import NQueenStats from "@/components/AlgoPage/NQueen/Stats";
import { AlgoData } from "@/components/Shared";
import { setAlgoName, setAlgoId, setAlgoCategory } from "@/redux/reducers/pageSlice";
import { initializeBoard } from "@/components/AlgoPage/NQueen/NQueenUtils/algorithms";
import { setBoard } from "@/redux/reducers/nQueenSlice";
import { useRouter } from "next/router";
import { ToProperCase } from "@/utils";

export default function NQueenPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const rawAlgoId = 'n-queen';
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
      <Seo category="others" id="n-queen" />
      <div className="px-gap">
        <NQueenControllers />
        <NQueenVisualizer />
        <NQueenStats />
        <AlgoData />
        <Footer />
      </div>
    </div>
  );
}
