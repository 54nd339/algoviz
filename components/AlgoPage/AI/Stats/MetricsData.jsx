import { useSelector } from "react-redux";

export default function MetricsData() {
  const mse = useSelector((state) => state.ai.mse);
  const rmse = useSelector((state) => state.ai.rmse);
  const rSquared = useSelector((state) => state.ai.rSquared);
  const algoId = useSelector((state) => state.page.algoId);

  if (algoId === "linear-regression") {
    return (
      <div className="flex flex-col font-space p-gap justify-between border-b-[10px] border-b-purple-bg">
        <div className="flex justify-between gap-[2rem] text-[15px]">
          <div className="text-green uppercase">Model Metrics</div>
        </div>
        <div className="flex justify-between pt-[3rem] text-[15px]">
          <div className="flex flex-col gap-[1rem]">
            <div>
              <span className="text-green uppercase">MSE: </span>
              <span className="text-blue">{mse.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-green uppercase">RMSE: </span>
              <span className="text-blue">{rmse.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-green uppercase">R²: </span>
              <span className="text-blue">{rSquared.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (algoId === "k-nearest-neighbors") {
    return null; // No metrics for KNN
  } else if (algoId === "k-means-clustering") {
    return (
      <div className="flex flex-col font-space p-gap justify-between border-b-[10px] border-b-purple-bg">
        <div className="text-green uppercase">K-Means Metrics - Coming Soon</div>
      </div>
    );
  }

  return null;
}
