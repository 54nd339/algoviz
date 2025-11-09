import LossData from "./LossData";
import AccuracyData from "./AccuracyData";
import EpochData from "./EpochData";

const StatsContainer = () => {
  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-twoStatsLayout border-[1px] border-border-1 mt-gap select-none">
      <LossData />
      <AccuracyData />
      <EpochData />
    </div>
  );
};

export default StatsContainer;
