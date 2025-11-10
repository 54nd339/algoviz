import React from "react";
import VisitedCountData from "./VisitedCountData";
import TotalMovesData from "./TotalMovesData";
import MessageData from "./MessageData";

const Stats = () => {
  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-threeStatsLayout border-[1px] border-border-1 mt-gap select-none">
      <VisitedCountData />
      <TotalMovesData />
      <MessageData />
    </div>
  );
};

export default Stats;
