import Image from "next/image";
import { useEffect } from "react";
import { batch } from "react-redux";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import Seo from "@/components/Seo";
import { ToProperCase } from "@/utils";
import Footer from "@/components/Footer";
import {
  setAlgoId,
  setAlgoName,
  setAlgoCategory,
} from "@/redux/reducers/pageSlice";
import GraphTraversalControllers from "@/components/AlgoPage/MinSpanTree/Controllers";
import VisualizerContainer from "@/components/AlgoPage/MinSpanTree/Visualizer";
import StatsContainer from "@/components/AlgoPage/MinSpanTree/Stats";
import { AlgoData } from "@/components/Shared";
import VisualizerEdgeLeftIcon from "@/public/assets/visualizer-edge-left-icon.svg";
import VisualizerEdgeRightIcon from "@/public/assets/visualizer-edge-right-icon.svg";

export default function GraphTraversal() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    var rawAlgoId = router.query.algoid;
    var algoName = ToProperCase(rawAlgoId);

    if (algoName != undefined) {
      batch(() => {
        dispatch(setAlgoId(rawAlgoId));
        dispatch(setAlgoName(algoName));
        dispatch(setAlgoCategory("minimum-spanning-tree"));
      });
    }
  });

  return (
    <div>
      <Seo category="minimum-spanning-tree" id={router.query.algoid} />
      <div className="px-gap">
        <GraphTraversalControllers />
        <VisualizerContainer />
        <div className="flex justify-between mt-[-12px]">
          <Image
            className="scale-[0.8]"
            src={VisualizerEdgeLeftIcon}
            alt="icon"
          />
          <Image
            className="scale-[0.8]"
            src={VisualizerEdgeRightIcon}
            alt="icon"
          />
        </div>
        <StatsContainer />
        <AlgoData />
        <Footer />
      </div>
    </div>
  );
}
