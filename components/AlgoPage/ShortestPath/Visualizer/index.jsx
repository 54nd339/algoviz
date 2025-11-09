import React, { useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setNodes, setEdges } from "@/redux/reducers/graphSlice";
import TopBar from "@/components/TopBar";
import Connectors from "@/components/AlgoPage/MinSpanTree/Visualizer/Connectors";
import Node from "@/components/AlgoPage/MinSpanTree/Visualizer/Node";

export default function VisualizerContainer() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const { nodes, edges } = useSelector((s) => s.graph);

  // ensure there's an initial graph
  useEffect(() => {
    if (!nodes || nodes.length === 0) {
      // trigger generation by dispatching a small default graph
      const defaultNodes = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        x: 80 + (i % 4) * 160,
        y: 80 + Math.floor(i / 4) * 160,
      }));
      const genEdges = [];
      defaultNodes.forEach((n, i) => {
        for (let j = i + 1; j < defaultNodes.length; j++) {
          const dx = n.x - defaultNodes[j].x;
          const dy = n.y - defaultNodes[j].y;
          const w = Math.round(Math.hypot(dx, dy));
          if (i % 2 === 0 || j % 2 === 0)
            genEdges.push({ u: i, v: j, weight: w, id: `${i}-${j}` });
        }
      });
      dispatch(setNodes(defaultNodes));
      dispatch(setEdges(genEdges));
    }
  }, [dispatch, nodes]);

  // compute canvas size based on node coordinates
  const canvasSize = useMemo(() => {
    if (!nodes || nodes.length === 0) return { w: 900, h: 450 };
    const maxX = Math.max(...nodes.map((n) => n.x));
    const maxY = Math.max(...nodes.map((n) => n.y));
    return { w: Math.max(900, maxX + 120), h: Math.max(450, maxY + 120) };
  }, [nodes]);

  return (
    <div
      className="relative w-full min-h-[60vh] border-[1px] border-border-1 bg-graphPattern select-none overflow-x-auto"
      style={{ maxWidth: "100%", boxSizing: "border-box", overflowX: "auto" }}
    >
      <TopBar />
      <div className="min-h-[50vh] py-[2rem]">
        <div style={{ maxWidth: "76vw", width: "100%", margin: "0 auto" }}>
          <div
            id="visualizer-container"
            ref={containerRef}
            className="relative flex justify-start items-start"
            style={{ width: "max-content", height: canvasSize.h }}
          >
            <Connectors
              nodes={nodes}
              edges={edges}
              mstEdges={[]}
              containerRef={containerRef}
              canvasWidth={canvasSize.w}
              canvasHeight={canvasSize.h}
            />

            <div style={{ position: "relative", zIndex: 10, width: canvasSize.w, height: canvasSize.h }}>
              {nodes && nodes.length > 0 ? (
                nodes.map((n) => <Node key={n.id} node={n} />)
              ) : (
                <div className="text-text-3 font-space uppercase tracking-[0.1em]">
                  Generate a graph to begin
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
