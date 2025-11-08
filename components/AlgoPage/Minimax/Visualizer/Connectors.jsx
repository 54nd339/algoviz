import React, { useCallback, useEffect, useState } from 'react';

const Connectors = ({ tree, containerRef }) => {
  const [paths, setPaths] = useState([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const collectEdges = useCallback((node) => {
    const edges = [];
    if (!node) return edges;
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        edges.push([node.id, child.id]);
        edges.push(...collectEdges(child));
      });
    }
    return edges;
  }, []);

  const computePaths = useCallback(() => {
    const container = containerRef?.current;
    if (!container || !tree) {
      setPaths([]);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const edges = collectEdges(tree);

    const newPaths = edges.map(([p, c]) => {
      const pEl = document.getElementById(`node-${p}`);
      const cEl = document.getElementById(`node-${c}`);
      if (!pEl || !cEl) return null;
      const pr = pEl.getBoundingClientRect();
      const cr = cEl.getBoundingClientRect();

      const x1 = pr.left - containerRect.left + pr.width / 2 + container.scrollLeft;
      const y1 = pr.top - containerRect.top + pr.height / 2 + container.scrollTop;
      const x2 = cr.left - containerRect.left + cr.width / 2 + container.scrollLeft;
      const y2 = cr.top - containerRect.top + cr.height / 2 + container.scrollTop;

      const midY = (y1 + y2) / 2;

      const d = `M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`;

      const childStatus = cEl.getAttribute('data-status');
      const parentStatus = pEl.getAttribute('data-status');

      let stroke = '#9CA3AF';
      let dash = null;
      if (childStatus === 'pruned' || parentStatus === 'pruned') {
        stroke = '#FCA5A5';
        dash = '6 4';
      } else if (childStatus === 'evaluated' || parentStatus === 'evaluated') {
        stroke = '#34D399';
      } else if (childStatus === 'active' || parentStatus === 'active') {
        stroke = '#FBBF24';
      } else if (childStatus === 'selected' || parentStatus === 'selected') {
        stroke = '#60A5FA';
      }

      return { d, key: `${p}-${c}`, stroke, dash };
    });

    setPaths(newPaths.filter(Boolean));
    setSvgSize({ w: container.scrollWidth || container.clientWidth, h: container.scrollHeight || container.clientHeight });
  }, [collectEdges, containerRef, tree]);

  useEffect(() => {
    const t = setTimeout(() => computePaths(), 30);
    return () => clearTimeout(t);
  }, [tree, computePaths]);

  useEffect(() => {
    const handle = () => computePaths();
    window.addEventListener('resize', handle);
    const container = containerRef?.current;
    if (container) container.addEventListener('scroll', handle);
    const observer = new MutationObserver(() => computePaths());
    if (container) observer.observe(container, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener('resize', handle);
      if (container) container.removeEventListener('scroll', handle);
      observer.disconnect();
    };
  }, [computePaths, containerRef]);

  if (!tree) return null;

  return (
    <svg
      className="pointer-events-none absolute top-0 left-0"
      width={svgSize.w}
      height={svgSize.h}
      style={{ overflow: 'visible', zIndex: 0 }}
    >
      {paths.map((p) => (
        <path
          key={p.key}
          d={p.d}
          fill="none"
          stroke={p.stroke}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={p.dash ?? undefined}
          opacity={0.95}
        />
      ))}
    </svg>
  );
};

export default Connectors;
