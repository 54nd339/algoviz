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
import ShortestPathControllers from "@/components/AlgoPage/ShortestPath/Controllers";
import VisualizerContainer from "@/components/AlgoPage/ShortestPath/Visualizer";
import StatsContainer from "@/components/AlgoPage/ShortestPath/Stats";
import { AlgoData } from "@/components/Shared";
import VisualizerEdgeLeftIcon from "@/public/assets/visualizer-edge-left-icon.svg";
import VisualizerEdgeRightIcon from "@/public/assets/visualizer-edge-right-icon.svg";

export default function ShortestPath() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    var rawAlgoId = router.query.algoid;
    var algoName = ToProperCase(rawAlgoId);

    if (algoName != undefined) {
      batch(() => {
        dispatch(setAlgoId(rawAlgoId));
        dispatch(setAlgoName(algoName));
        dispatch(setAlgoCategory("shortest-path"));
      });
    }
  });

  return (
    <div>
      <Seo category="shortest-path" id={router.query.algoid} />
      <div className="px-gap">
        <ShortestPathControllers />
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
