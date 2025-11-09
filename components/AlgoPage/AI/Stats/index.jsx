import ModelData from "./ModelData";
import MetricsData from "./MetricsData";

const StatsContainer = () => {
  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-twoStatsLayout
      border-[1px] border-border-1 mt-gap select-none">
      <ModelData />
      <MetricsData />
    </div>
  );
}

export default StatsContainer;
