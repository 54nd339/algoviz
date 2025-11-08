import React, { useRef } from "react";
import { useSelector } from "react-redux";

import TopBar from "@/components/TopBar";
import TreeNode from "./TreeNode";
import Connectors from "./Connectors";

const VisualizerContainer = () => {
  const tree = useSelector((state) => state.minimax.tree);
  const containerRef = useRef(null);

  return (
    <div
      className="relative w-full min-h-[60vh] border-[1px] border-border-1 bg-graphPattern select-none overflow-x-auto"
      style={{ maxWidth: '100%', boxSizing: 'border-box', overflowX: 'auto' }}>
      <TopBar />
      <div className="min-h-[50vh] py-[2rem]">
        <div style={{ maxWidth: '76vw', width: '100%', margin: '0 auto' }}>
          <div
            id="visualizer-container"
            ref={containerRef}
            className="relative flex justify-start items-start"
            style={{ width: 'max-content' }}
          >
            <Connectors tree={tree} containerRef={containerRef} />

            <div style={{ position: 'relative', zIndex: 10 }}>
              {tree ? (
                <TreeNode node={tree} />
              ) : (
                <div className="text-text-3 font-space uppercase tracking-[0.1em]">
                  Generate a tree to begin
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerContainer;

