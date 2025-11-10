import React from "react";
import TotalSolutionsData from "./TotalSolutionsData";
import TotalAttemptsData from "./TotalAttemptsData";
import CurrentSolutionData from "./CurrentSolutionData";
import MessageData from "./MessageData";

const Stats = () => {
  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-threeStatsLayout border-[1px] border-border-1 mt-gap select-none">
      <TotalSolutionsData />
      <TotalAttemptsData />
      <CurrentSolutionData />
      <MessageData />
    </div>
  );
};

export default Stats;
