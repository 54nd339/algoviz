import React from "react";

const statusStyles = {
  idle: "border-border-1 bg-bg-2 text-text-1",
  active: "border-yellow bg-yellow-bg text-yellow",
  evaluated: "border-green bg-green-bg text-green",
  selected: "border-blue bg-blue-bg text-blue",
  pruned: "border-border-1 bg-bg-4 text-text-3 opacity-75",
};

const roleLabel = (node) => {
  if (node.role === "max") return "MAX";
  if (node.role === "min") return "MIN";
  return "LEAF";
};

const valueLabel = (node) => {
  if (node.role === "leaf") return node.value;
  if (node.computedValue !== null && node.computedValue !== undefined) {
    return node.computedValue;
  }
  return "";
};

const alphaBetaLabel = (node) => {
  if (node.role === "leaf") return null;
  const alpha = Number.isFinite(node.alpha) ? node.alpha : "-∞";
  const beta = Number.isFinite(node.beta) ? node.beta : "∞";
  return `α ${alpha} | β ${beta}`;
};

const TreeNode = ({ node }) => {
  const nodeStatus = statusStyles[node.status] ?? statusStyles.idle;
  const value = valueLabel(node);
  const abLabel = alphaBetaLabel(node);

  return (
    <div className="flex flex-col items-center gap-4 min-w-[120px] shrink-0">
      <div
        className={`flex flex-col items-center justify-center w-[90px] h-[90px] rounded-full border-[3px] shadow-md font-space uppercase text-[0.9rem] transition-colors duration-200 ${nodeStatus}`}
      >
        <span>{roleLabel(node)}</span>
        {value !== "" && (
          <span className="text-[1rem] font-semibold">{value}</span>
        )}
      </div>
      {abLabel && (
        <div className="text-text-3 text-sm font-mono">{abLabel}</div>
      )}
      {node.children && node.children.length > 0 && (
        <div className="flex flex-row justify-center gap-6">
          {node.children.map((child) => (
            <TreeNode node={child} key={child.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;

