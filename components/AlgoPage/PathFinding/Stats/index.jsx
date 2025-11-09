import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const StatsContainer = () => {
  const { status, grid, cellSize, rowCount, colCount } = useSelector((state) => state.path);
  const algoName = useSelector((state) => state.page.algoName);
  const [stats, setStats] = useState({ visited: 0, walls: 0, pathLength: 0, total: rowCount * colCount });

  // Update stats when algorithm runs or status changes
  useEffect(() => {
    const updateStats = () => {
      let visited = 0;
      let walls = 0;
      let pathLength = 0;

      // Count walls from grid
      if (grid && grid.length > 0) {
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            const node = grid[row][col];
            if (node.isWall) walls++;
          }
        }
      }

      // Count nodes with visited and path classes from DOM
      if (typeof document !== "undefined") {
        const visitedNodes = document.querySelectorAll(".node-visited");
        const pathNodes = document.querySelectorAll(".node-path");
        visited = visitedNodes.length + pathNodes.length; // Include path nodes as visited
        pathLength = pathNodes.length;
      }

      setStats({
        visited,
        walls,
        pathLength,
        total: rowCount * colCount
      });
    };

    // Update immediately
    updateStats();

    // Also set up an interval to continuously check for updates
    const interval = setInterval(updateStats, 100);

    return () => clearInterval(interval);
  }, [grid, rowCount, colCount, status]);

  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-twoStatsLayout border-[1px] border-border-1 mt-gap select-none">
      {/* Maze Statistics */}
      <div className="flex flex-col font-space p-gap border-r-[1px] border-r-border-1 justify-between border-b-[10px] border-b-cyan-bg overflow-x-auto">
        <div className="flex justify-between gap-[2rem] text-[15px]">
          <div className="flex gap-[0.5rem] text-text-1 flex-wrap text-[1.1rem] min-w-[320px]">
            <span className="text-green">Algorithm</span>
            <span className="text-cyan">{algoName}</span>
          </div>
        </div>

        <div className="flex justify-between pt-[3rem] text-[15px]">
          <div>
            <span className="text-green uppercase">Maze Configuration</span>
          </div>
        </div>

        <div className="pt-[1rem] flex flex-col gap-[1rem] text-[0.9rem]">
          <div className="flex justify-between">
            <span className="text-text-1">Grid Size:</span>
            <span className="text-cyan font-semibold">
              {rowCount} × {colCount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-1">Cell Size:</span>
            <span className="text-cyan font-semibold">{cellSize}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-1">Total Cells:</span>
            <span className="text-cyan font-semibold">{stats.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-1">Walls:</span>
            <span className="text-purple font-semibold">{stats.walls}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-1">Walkable:</span>
            <span className="text-blue font-semibold">{stats.total - stats.walls}</span>
          </div>
        </div>
      </div>

      {/* Path Finding Results */}
      <div className="hidden lg:flex flex-col h-full font-space p-gap justify-between border-b-[10px] border-b-green-bg border-r-[1px] border-r-border-1 overflow-x-auto">
        <div className="flex flex-col min-w-[300px]">
          <div className="text-purple uppercase text-[15px]">
            Status <span className="text-green">{status}</span>
          </div>
          <div className="text-text-1 text-[2.4rem] mt-[1rem]">
            {status === "path found" && stats.pathLength > 0 ? (
              <span className="text-green">✓ Found</span>
            ) : status === "maze generated" ? (
              <span className="text-blue">Generated</span>
            ) : status === "path found" && stats.pathLength === 0 ? (
              <span className="text-red-500">✗ Not Found</span>
            ) : (
              <span className="text-text-1">Ready</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[1rem] text-[0.9rem] pt-[2rem]">
          <div className="flex justify-between uppercase">
            <span className="text-green">Algorithm</span>
            <span className="text-green">
              {algoName === "A Star" ? (
                <span className="text-cyan">A*</span>
              ) : (
                <span className="text-cyan">{algoName}</span>
              )}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-1 uppercase">Cells Explored:</span>
            <span className="text-cyan font-semibold">{stats.visited}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-text-1 uppercase">Final Path Length:</span>
            <span className="text-green font-semibold">{stats.pathLength}</span>
          </div>

          {stats.visited > 0 && (
            <div className="flex justify-between">
              <span className="text-text-1 uppercase">Efficiency:</span>
              <span className="text-blue font-semibold">
                {((stats.pathLength / stats.visited) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsContainer;
