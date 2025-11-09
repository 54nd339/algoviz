import { useSelector } from "react-redux";
import ModelData from "./ModelData";
import MetricsData from "./MetricsData";

const StatsContainer = () => {
  const algoId = useSelector((state) => state.page.algoId);
  const isKNN = algoId === "knn";

  return (
    <div className={`relative flex flex-row flex-wrap lg:grid ${
      isKNN ? "lg:grid-cols-1" : "lg:grid-cols-twoStatsLayout"
    } border-[1px] border-border-1 mt-gap select-none`}>
      <ModelData />
      {!isKNN && <MetricsData />}
    </div>
  );
}

export default StatsContainer;
