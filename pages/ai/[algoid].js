import Image from "next/image";
import { useEffect } from "react";
import { batch } from "react-redux";
import { useRouter } from "next/router";
import Seo from "@/components/Seo";
import { ToProperCase } from "@/utils";
import Footer from "@/components/Footer";
import {
  setAlgoId,
  setAlgoName,
  setAlgoCategory,
} from "@/redux/reducers/pageSlice";
import { useDispatch } from "react-redux";
import AlgoData from "@/components/AlgoPage/AI/AlgoData";
import StatsContainer from "@/components/AlgoPage/AI/Stats";
import { setRunning, resetStats, setDataPoints } from "@/redux/reducers/aiSlice";
import VisualizerContainer from "@/components/AlgoPage/AI/Visualizer";
import AIControllers from "@/components/AlgoPage/AI/Controllers";
import VisualizerEdgeLeftIcon from "@/public/assets/visualizer-edge-left-icon.svg";
import VisualizerEdgeRightIcon from "@/public/assets/visualizer-edge-right-icon.svg";
import { generateDataPoints } from "@/components/AlgoPage/AI/AIUtils/algorithms";

export default function AI() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    var rawAlgoId = router.query.algoid;
    var algoName = ToProperCase(rawAlgoId);

    if (algoName != undefined) {
      batch(() => {
        // Set algorithm ID first so generateDataPoints knows which algorithm to use
        dispatch(setAlgoId(rawAlgoId));
        dispatch(setAlgoName(algoName));
        dispatch(setAlgoCategory("ai"));
        dispatch(setRunning(false));
        dispatch(resetStats());
        // Generate initial data points - now algoId is set in Redux
        const initialData = generateDataPoints(50);
        dispatch(setDataPoints(initialData));
      });
    }
  }, [router.query.algoid, dispatch]);

  return (
    <div>
      <Seo category="ai" id={router.query.algoid} />
      <div className="px-gap">
        <AIControllers />
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
