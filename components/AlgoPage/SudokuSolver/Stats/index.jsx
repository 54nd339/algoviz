import BacktrackData from "./BacktrackData";
import FilledCellsData from "./FilledCellsData";
import StepsData from "./StepsData";

const Stats = () => {
  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-threeStatsLayout border-[1px] border-border-1 mt-gap select-none">
      <BacktrackData />
      <FilledCellsData />
      <StepsData />
    </div>
  );
};

export default Stats;
