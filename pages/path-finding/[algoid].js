import React from "react";
import { batch } from "react-redux";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import { ToProperCase } from "@/utils";
import {
  setAlgoId,
  setAlgoName,
  setAlgoCategory,
} from "@/redux/reducers/pageSlice";
import AlgoData from "@/components/AlgoPage/PathFinding/AlgoData";
import StatsContainer from "@/components/AlgoPage/PathFinding/Stats";
import VisualizerContainer from "@/components/AlgoPage/PathFinding/Visualizer";
import generateGrid from "@/components/AlgoPage/PathFinding/MazeUtils/generateGrid";
import MazeGenerationControllers from "@/components/AlgoPage/PathFinding/Controllers";

export default function Sorting() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    var rawAlgoId = router.query.algoid;
    var algoName = ToProperCase(rawAlgoId);

    if (algoName != undefined) {
      batch(() => {
        dispatch(setAlgoId(rawAlgoId));
        dispatch(setAlgoName(algoName));
        dispatch(setAlgoCategory("path-finding"));
      });
    }
    generateGrid();
  });

  return (
    <div>
      <Seo category="path-finding" id={router.query.algoid} />
      <div className="px-gap">
        <MazeGenerationControllers />
        <VisualizerContainer />
        <StatsContainer />
        <AlgoData />
        <Footer />
      </div>
    </div>
  );
}