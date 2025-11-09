import React from "react";
import MstData from "./mstData";
import ComparisonData from "./comparisonData";

export default function StatsContainer() {
  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-twoStatsLayout border-[1px] border-border-1 mt-gap select-none">
      <MstData />
      <ComparisonData />
    </div>
  );
}
