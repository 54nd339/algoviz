import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsRunning, setDistances, setAllDistances } from "@/redux/reducers/graphSlice";
import computeDijkstra from "@/components/AlgoPage/ShortestPath/ShortestPathUtils/dijkstra";
import computeBellmanFord from "@/components/AlgoPage/ShortestPath/ShortestPathUtils/bellmanFord";
import computeFloydWarshall from "@/components/AlgoPage/ShortestPath/ShortestPathUtils/floydWarshall";

export default function StartButton() {
  const dispatch = useDispatch();
  const { nodes, edges, sourceNode, isRunning } = useSelector((s) => s.graph);
  const algoName = useSelector((s) => s.page.algoName || "");

  const start = async () => {
    if (isRunning) {
      dispatch(setIsRunning(false));
      return;
    }
    if (!nodes || nodes.length === 0) return;

    const isFloydWarshall = algoName.toLowerCase().includes("floyd");

    // Validate source node for non-Floyd algorithms
    if (!isFloydWarshall && sourceNode === null) {
      alert("Please select a source node");
      return;
    }

    dispatch(setIsRunning(true));

    try {
      if (isFloydWarshall) {
        // All-pairs shortest paths
        const result = computeFloydWarshall(nodes, edges);
        dispatch(setAllDistances(result.distances));
      } else if (algoName.toLowerCase().includes("bellman")) {
        // Single-source shortest paths (handles negative weights)
        const result = computeBellmanFord(nodes, edges, sourceNode);
        dispatch(setDistances(result.distances));
        if (result.hasNegativeCycle) {
          alert("Warning: Negative cycle detected in graph!");
        }
      } else if (algoName.toLowerCase().includes("dijkstra")) {
        // Single-source shortest paths
        const result = computeDijkstra(nodes, edges, sourceNode);
        dispatch(setDistances(result.distances));
      }
    } catch (error) {
      console.error("Algorithm error:", error);
      alert("Error running algorithm: " + error.message);
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
          className="w-full h-full bg-red-bg flex justify-center items-center text-text-1 font-space uppercase border-l-[10px] border-red text-[1rem] md:text-lg  hover:cursor-pointer hover:bg-red hover:text-bg-1 select-none leading-[105%]"
          onClick={() => dispatch(setIsRunning(false))}
        >
          Stop
        </div>
      )}
    </div>
  );
}
