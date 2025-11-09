import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setNodeStatus } from "@/redux/reducers/graphSlice";
import { graphTheme } from "../graphTheme";

// Single graph node styled similar to Minimax TreeNode, positioned absolutely by x/y
const Node = ({ node }) => {
  const dispatch = useDispatch();
  const nodeStatus = useSelector((s) => s.graph.nodeStatuses[node.id] || "idle");
  const size = 64; // px diameter
  const left = node.x - size / 2;
  const top = node.y - size / 2;

  const theme = graphTheme.node[nodeStatus] || graphTheme.node.idle;

  const handleMouseEnter = useCallback(() => {
    dispatch(setNodeStatus({ nodeId: node.id, status: "active" }));
  }, [dispatch, node.id]);

  const handleMouseLeave = useCallback(() => {
    dispatch(setNodeStatus({ nodeId: node.id, status: "idle" }));
  }, [dispatch, node.id]);

  return (
    <div
      id={`graph-node-${node.id}`}
      className={`absolute flex items-center justify-center rounded-full border-[3px] shadow-md font-space uppercase text-[0.9rem] transition-colors duration-${graphTheme.animation.nodeTransition} ${theme.border} ${theme.bg} ${theme.text}`}
      style={{ width: size, height: size, left, top, boxSizing: "border-box", backgroundClip: "padding-box" }}
      data-status={nodeStatus}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="text-[0.9rem] font-semibold">{node.id}</span>
    </div>
  );
};

export default Node;
