import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setNodeStatus, setNodes } from "@/redux/reducers/graphSlice";
import { graphTheme } from "../graphTheme";

// Single graph node styled similar to Minimax TreeNode, positioned absolutely by x/y
const Node = ({ node }) => {
  const dispatch = useDispatch();
  const nodeStatus = useSelector((s) => s.graph.nodeStatuses[node.id] || "idle");
  const nodes = useSelector((s) => s.graph.nodes);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const size = 64; // px diameter
  const left = node.x - size / 2;
  const top = node.y - size / 2;

  const theme = graphTheme.node[nodeStatus] || graphTheme.node.idle;

  const handleMouseEnter = useCallback(() => {
    dispatch(setNodeStatus({ nodeId: node.id, status: "active" }));
  }, [dispatch, node.id]);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      dispatch(setNodeStatus({ nodeId: node.id, status: "idle" }));
    }
  }, [dispatch, node.id, isDragging]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const container = document.getElementById("visualizer-container");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    // Update the node position
    const updatedNodes = nodes.map((n) =>
      n.id === node.id ? { ...n, x: newX, y: newY } : n
    );
    dispatch(setNodes(updatedNodes));
  }, [isDragging, dragOffset, node.id, nodes, dispatch]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dispatch(setNodeStatus({ nodeId: node.id, status: "idle" }));
  }, [dispatch, node.id]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      id={`graph-node-${node.id}`}
      className={`absolute flex items-center justify-center rounded-full border-[3px] shadow-md font-space uppercase text-[0.9rem] transition-colors duration-${graphTheme.animation.nodeTransition} ${theme.border} ${theme.bg} ${theme.text}`}
      style={{ 
        width: size, 
        height: size, 
        left, 
        top, 
        boxSizing: "border-box", 
        backgroundClip: "padding-box",
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      data-status={nodeStatus}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
    >
      <span className="text-[0.9rem] font-semibold">{node.id}</span>
    </div>
  );
};

export default Node;
