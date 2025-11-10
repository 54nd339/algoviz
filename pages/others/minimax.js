import React, { useEffect } from "react";
import { batch } from "react-redux";
import { useDispatch } from "react-redux";

import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import { ToProperCase } from "@/utils";
import { setAlgoCategory, setAlgoId, setAlgoName } from "@/redux/reducers/pageSlice";
import { setIsRunning } from "@/redux/reducers/minimaxSlice";
import generateTree from "@/components/AlgoPage/Minimax/MinimaxUtils/generateTree";
import MinimaxControllers from "@/components/AlgoPage/Minimax/Controllers";
import VisualizerContainer from "@/components/AlgoPage/Minimax/Visualizer";
import StatsContainer from "@/components/AlgoPage/Minimax/Stats";
import { AlgoData } from "@/components/Shared";

const MinimaxPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const rawAlgoId = "minimax";
    const algoName = ToProperCase(rawAlgoId);

    dispatch(setIsRunning(false));
    generateTree();

    if (algoName) {
      batch(() => {
        dispatch(setAlgoId(rawAlgoId));
        dispatch(setAlgoName(algoName));
        dispatch(setAlgoCategory("others"));
      });
    }
  }, [dispatch]);

  return (
    <div>
      <Seo category="others" id="minimax" />
      <div className="px-gap">
        <MinimaxControllers />
        <VisualizerContainer />
        <StatsContainer />
        <AlgoData />
        <Footer />
      </div>
    </div>
  );
};

export default MinimaxPage;

