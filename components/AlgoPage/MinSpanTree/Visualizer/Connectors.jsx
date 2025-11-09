import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { graphTheme } from "../graphTheme";

// Draws edges between graph nodes using an overlay SVG, styled similar to Minimax connectors
const Connectors = ({ nodes, edges, mstEdges, containerRef, canvasWidth = 900, canvasHeight = 450 }) => {
  const [paths, setPaths] = useState([]);
  const [svgSize, setSvgSize] = useState({ w: canvasWidth, h: canvasHeight });
  const edgeStatuses = useSelector((s) => s.graph.edgeStatuses || {});
  const animatingEdges = useSelector((s) => s.graph.animatingEdges || []);

  const isEdgeInMst = useCallback(
    (edge) => {
      if (!mstEdges || mstEdges.length === 0) return false;
      return mstEdges.some(
        (e) => (e.u === edge.u && e.v === edge.v) || (e.u === edge.v && e.v === edge.u)
      );
    },
    [mstEdges]
  );

  const getEdgeStatus = useCallback(
    (edge) => {
      const edgeId = edge.id || `${edge.u}-${edge.v}`;
      return edgeStatuses[edgeId] || (isEdgeInMst(edge) ? "idle" : "idle");
    },
    [edgeStatuses, isEdgeInMst]
  );

  const getEdgeColor = useCallback(
    (edge) => {
      const status = getEdgeStatus(edge);
      const inMst = isEdgeInMst(edge);

      if (status === "active") return graphTheme.edge.active;
      if (status === "animating") return graphTheme.edge.animating;
      if (inMst) return graphTheme.edge.mst;
      return graphTheme.edge.default;
    },
    [getEdgeStatus, isEdgeInMst]
  );

  const getEdgeStrokeWidth = useCallback(
    (edge) => {
      const status = getEdgeStatus(edge);
      const inMst = isEdgeInMst(edge);

      if (status === "active" || status === "animating") return graphTheme.strokeWidth.active;
      if (inMst) return graphTheme.strokeWidth.mst;
      return graphTheme.strokeWidth.default;
    },
    [getEdgeStatus, isEdgeInMst]
  );

  const computePaths = useCallback(() => {
    const container = containerRef?.current;
    if (!container || !nodes || nodes.length === 0 || !edges) {
      setPaths([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();

    const newPaths = edges.map((edge) => {
      const aId = `graph-node-${edge.u}`;
      const bId = `graph-node-${edge.v}`;
      const aEl = document.getElementById(aId);
      const bEl = document.getElementById(bId);
      if (!aEl || !bEl) return null;

      const ar = aEl.getBoundingClientRect();
      const br = bEl.getBoundingClientRect();

      const x1 = ar.left - containerRect.left + ar.width / 2 + container.scrollLeft;
      const y1 = ar.top - containerRect.top + ar.height / 2 + container.scrollTop;
      const x2 = br.left - containerRect.left + br.width / 2 + container.scrollLeft;
      const y2 = br.top - containerRect.top + br.height / 2 + container.scrollTop;

      const d = `M ${x1} ${y1} L ${x2} ${y2}`;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      const stroke = getEdgeColor(edge);
      const width = getEdgeStrokeWidth(edge);
      const edgeId = edge.id || `${edge.u}-${edge.v}`;
      const isAnimating = animatingEdges.includes(edgeId);

      return {
        key: edgeId,
        d,
        stroke,
        width,
        label: edge.weight,
        lx: midX,
        ly: midY - 8,
        isAnimating,
      };
    });

    setPaths(newPaths.filter(Boolean));
    setSvgSize({
      w: container.scrollWidth || Math.max(canvasWidth, container.clientWidth),
      h: container.scrollHeight || Math.max(canvasHeight, container.clientHeight),
    });
  }, [containerRef, nodes, edges, getEdgeColor, getEdgeStrokeWidth, animatingEdges, canvasWidth, canvasHeight]);

  useEffect(() => {
    const t = setTimeout(() => computePaths(), 30);
    return () => clearTimeout(t);
  }, [nodes, edges, mstEdges, edgeStatuses, animatingEdges, computePaths]);

  useEffect(() => {
    const handle = () => computePaths();
    window.addEventListener("resize", handle);
    const container = containerRef?.current;
    if (container) container.addEventListener("scroll", handle);
    const observer = new MutationObserver(() => computePaths());
    if (container) observer.observe(container, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener("resize", handle);
      if (container) container.removeEventListener("scroll", handle);
      observer.disconnect();
    };
  }, [computePaths, containerRef]);

  if (!nodes || nodes.length === 0) return null;

  return (
    <>
      <style jsx>{`
        @keyframes pulse-edge {
          0% {
            stroke-width: ${graphTheme.strokeWidth.active}px;
            opacity: 0.8;
          }
          50% {
            stroke-width: ${graphTheme.strokeWidth.mst}px;
            opacity: 1;
          }
          100% {
            stroke-width: ${graphTheme.strokeWidth.active}px;
            opacity: 0.8;
          }
        }
        .edge-animating {
          animation: pulse-edge ${graphTheme.animation.edgeDuration} ease-in-out infinite;
        }
      `}</style>
      <svg
        className="pointer-events-none absolute top-0 left-0"
        width={svgSize.w}
        height={svgSize.h}
        style={{ overflow: "visible", zIndex: 0 }}
      >
        {paths.map((p) => (
          <g key={p.key}>
            <path
              className={p.isAnimating ? "edge-animating" : ""}
              d={p.d}
              fill="none"
              stroke={p.stroke}
              strokeWidth={p.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.95}
            />
            {Number.isFinite(p.label) && (
              <text x={p.lx} y={p.ly} fontSize={12} fill={graphTheme.text.edge} textAnchor="middle">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </>
  );
};

export default Connectors;
