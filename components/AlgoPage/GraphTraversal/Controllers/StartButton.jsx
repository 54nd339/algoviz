import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsRunning, setMstEdges } from "@/redux/reducers/graphSlice";
import computePrim from "@/components/AlgoPage/MinSpanTree/GraphTraversalUtils/prim";
import computeKruskal from "@/components/AlgoPage/MinSpanTree/GraphTraversalUtils/kruskal";

export default function StartButton() {
  const dispatch = useDispatch();
  const { nodes, edges, speed, isRunning } = useSelector((s) => s.graph);
  const algoName = useSelector((s) => s.page.algoName || "");

  const start = async () => {
    if (isRunning) {
      dispatch(setIsRunning(false));
      return;
    }
    if (!nodes || nodes.length === 0) return;
    dispatch(setIsRunning(true));

    // compute MST steps based on algorithm
    let mst = [];
    if (algoName.toLowerCase().includes("kruskal")) {
      mst = computeKruskal(nodes, edges);
    } else {
      // default to Prim
      mst = computePrim(nodes, edges);
    }

    // animate edges sequentially using speed
    for (let i = 0; i < mst.length; i++) {
      // wait for speed ms
      await new Promise((res) => setTimeout(res, speed));
      // add next edge to the redux state
      dispatch(setMstEdges(mst.slice(0, i + 1)));
    }

    dispatch(setIsRunning(false));
  };

  return (
    <div className="relative w-full h-full lg:max-w-[250px] flex">
      {isRunning === false ? (
        <div
          className="w-full h-full bg-green-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-green text-[1rem] md:text-lg hover:cursor-pointer hover:bg-green hover:text-bg-1 select-none leading-[105%]"
          onClick={start}
        >
          Start
        </div>
      ) : (
        <div
          className="w-full h-full bg-red-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-red text-[1rem] md:text-lg hover:cursor-pointer hover:bg-red hover:text-bg-1 select-none leading-[105%]"
          onClick={() => dispatch(setIsRunning(false))}
        >
          Stop
        </div>
      )}
    </div>
  );
}
