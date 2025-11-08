import ConfigData from "./ConfigData";
import EvaluationData from "./EvaluationData";

const StatsContainer = () => {
  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-twoStatsLayout border-[1px] border-border-1 mt-gap select-none">
      <EvaluationData />
      <ConfigData />
    </div>
  );
};

export default StatsContainer;

