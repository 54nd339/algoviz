import { useSelector } from "react-redux";

export default function ModelData() {
  const slope = useSelector((state) => state.ai.slope);
  const intercept = useSelector((state) => state.ai.intercept);
  const iterations = useSelector((state) => state.ai.iterations);
  const maxIterations = useSelector((state) => state.ai.maxIterations);
  const learningRate = useSelector((state) => state.ai.learningRate);
  const algoId = useSelector((state) => state.page.algoId);

  const percentage = maxIterations > 0 ? ((iterations / maxIterations) * 100).toFixed(1) : 0;

  // Render based on algorithm type
  if (algoId === "linear-regression") {
    return (
      <div className="flex flex-col font-space p-gap border-r-[1px] border-r-border-1 justify-between border-b-[10px] border-b-green-bg">
        <div className="flex justify-between gap-[2rem] text-[15px]">
          <div className="flex gap-[0.2rem] text-text-1 flex-wrap text-[1.3rem]">
            <span className="text-green uppercase">Model:</span>
            <span className="text-cyan">y = </span>
            <span className="text-blue">{slope.toFixed(4)}</span>
            <span className="text-cyan">x + </span>
            <span className="text-blue">{intercept.toFixed(4)}</span>
          </div>
        </div>
        <div className="flex justify-between pt-[1.5rem] text-[15px]">
          <div>
            <span className="text-green uppercase">Learning Rate</span>
          </div>
          <div>
            <span className="text-blue uppercase">{learningRate.toFixed(4)}</span>
          </div>
        </div>
        <div className="flex justify-between pt-[1.5rem] text-[15px]">
          <div>
            <span className="text-green uppercase">Training Progress</span>
          </div>
          <div className="flex gap-[1rem]">
            <span className="text-cyan uppercase">
              {iterations} / {maxIterations}
            </span>
            <span className="text-blue uppercase">{percentage}%</span>
          </div>
        </div>
      </div>
    );
  } else if (algoId === "knn") {
    return (
      <div className="flex flex-col font-space p-gap border-r-[1px] border-r-border-1 justify-between border-b-[10px] border-b-green-bg">
        <div className="text-green uppercase">KNN Data - Coming Soon</div>
      </div>
    );
  } else if (algoId === "k-means") {
    return (
      <div className="flex flex-col font-space p-gap border-r-[1px] border-r-border-1 justify-between border-b-[10px] border-b-green-bg">
        <div className="text-green uppercase">K-Means Data - Coming Soon</div>
      </div>
    );
  }

  return null;
}
