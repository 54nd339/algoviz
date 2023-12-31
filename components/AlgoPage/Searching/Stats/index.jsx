import ArrayData from "./ArrayData";
import ComparisonData from "./ComparisonData";

const StatsContainer = () => {
  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-twoStatsLayout
      border-[1px] border-border-1 mt-gap select-none">
      <ArrayData />
      <ComparisonData />
    </div>
  );
}

export default StatsContainer;
