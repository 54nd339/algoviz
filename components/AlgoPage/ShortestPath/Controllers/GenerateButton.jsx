import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNodes, setEdges, resetGraphStats } from "@/redux/reducers/graphSlice";

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export default function GenerateButton() {
  const dispatch = useDispatch();
  const nodeCount = useSelector((s) => s.graph.nodeCount);

  const generateGraph = () => {
    // generate random nodes inside a viewport
    const nodes = Array.from({ length: nodeCount }).map((_, i) => ({
      id: i,
      x: 60 + Math.random() * 760,
      y: 60 + Math.random() * 360,
    }));

    // connect each node to its 3 nearest neighbors
    const edges = [];
    nodes.forEach((n, i) => {
      const distances = nodes
        .map((m, j) => ({ j, d: i === j ? Infinity : distance(n, m) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      distances.forEach((d) => {
        const u = i;
        const v = d.j;
        if (u < v) {
          edges.push({ u, v, weight: Math.round(d.d), id: `${u}-${v}` });
        }
      });
    });

    dispatch(resetGraphStats());
    dispatch(setNodes(nodes));
    dispatch(setEdges(edges));
  };

  return (
    <div
      onClick={generateGraph}
      className="relative w-full h-full lg:max-w-[250px] bg-blue-bg flex justify-center items-center text-text-1 font-space uppercase select-none border-l-[10px] border-blue text-[1rem] md:text-lg hover:cursor-pointer hover:bg-blue hover:text-bg-1 leading-[105%]"
      aria-label="Generate graph"
    >
      Generate Graph
    </div>
  );
}
