import { useSelector } from "react-redux";
import ModelData from "./ModelData";
import MetricsData from "./MetricsData";

const StatsContainer = () => {
  const algoId = useSelector((state) => state.page.algoId);
  const isKNNOrKMeans = algoId === "knn" || algoId === "k-means";

  return (
    <div className={`relative flex flex-row flex-wrap lg:grid ${
      isKNNOrKMeans ? "lg:grid-cols-1" : "lg:grid-cols-twoStatsLayout"
    } border-[1px] border-border-1 mt-gap select-none`}>
      <ModelData />
      {!isKNNOrKMeans && <MetricsData />}
    </div>
  );
}

export default StatsContainer;
