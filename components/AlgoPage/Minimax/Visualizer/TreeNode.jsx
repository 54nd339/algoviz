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

const TreeNode = ({ node }) => {
  const nodeStatus = statusStyles[node.status] ?? statusStyles.idle;
  const value = valueLabel(node);

  const alpha = Number.isFinite(node.alpha) ? node.alpha : null;
  const beta = Number.isFinite(node.beta) ? node.beta : null;

  const pruneReason = node.pruneReason
    ? node.pruneReason
    : node.status === "pruned"
    ? alpha !== null && beta !== null && alpha >= beta
      ? `Pruned: α (${alpha}) ≥ β (${beta})`
      : "Pruned"
    : null;

  return (
    <div className="flex flex-col items-center gap-4 min-w-[120px] shrink-0">
      <div className="flex flex-col items-center gap-1">
        {/* alpha/beta badges */}
        <div className="flex gap-2 items-center">
          <div
            className="text-[0.7rem] font-mono px-2 py-0.5 rounded-md"
            style={{
              background: 'rgba(226, 232, 240, 0.12)',
              color: '#0f172a',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)'
            }}
          >
            {alpha !== null ? `α ${alpha}` : "α -∞"}
          </div>
          <div
            className="text-[0.7rem] font-mono px-2 py-0.5 rounded-md"
            style={{
              background: 'rgba(226, 232, 240, 0.12)',
              color: '#0f172a',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)'
            }}
          >
            {beta !== null ? `β ${beta}` : "β ∞"}
          </div>
        </div>

        <div
          id={`node-${node.id}`}
          data-status={node.status}
          data-alpha={alpha !== null ? alpha : ""}
          data-beta={beta !== null ? beta : ""}
          className={`flex flex-col items-center justify-center w-[90px] h-[90px] rounded-full border-[3px] shadow-md font-space uppercase text-[0.9rem] transition-colors duration-200 ${nodeStatus}`}
          style={{ boxSizing: "border-box", backgroundClip: 'padding-box' }}
        >
          <span>{roleLabel(node)}</span>
          {value !== "" && (
            <span className="text-[1rem] font-semibold">{value}</span>
          )}
        </div>
        {pruneReason && (
          <div className="text-[0.75rem] text-red-500 mt-1 font-mono">{pruneReason}</div>
        )}
      </div>

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

