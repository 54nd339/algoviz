// Centralized color and styling theme for GraphTraversal components
export const graphTheme = {
  // Node statuses
  node: {
    idle: {
      border: "border-border-1",
      bg: "bg-bg-2",
      text: "text-text-1",
      fill: "#1f2937",
      stroke: "#64748b",
    },
    active: {
      border: "border-yellow",
      bg: "bg-yellow-bg",
      text: "text-yellow",
      fill: "#fef3c7",
      stroke: "#fbbf24",
    },
    visited: {
      border: "border-green",
      bg: "bg-green-bg",
      text: "text-green",
      fill: "#d1fae5",
      stroke: "#34d399",
    },
    selected: {
      border: "border-blue",
      bg: "bg-blue-bg",
      text: "text-blue",
      fill: "#dbeafe",
      stroke: "#60a5fa",
    },
  },

  // Edge colors
  edge: {
    default: "#9ca3af",
    mst: "#34d399",
    active: "#fbbf24",
    animating: "#60a5fa",
  },

  // Edge widths
  strokeWidth: {
    default: 2,
    mst: 4,
    active: 3,
  },

  // Animation timings
  animation: {
    edgeDuration: "0.6s",
    nodeTransition: "200ms",
  },

  // Text colors
  text: {
    edge: "#e5e7eb",
    muted: "#9ca3af",
  },
};
