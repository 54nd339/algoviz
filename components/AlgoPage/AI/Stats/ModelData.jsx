import { useSelector } from "react-redux";
import * as Colors from "@/components/AlgoPage/AI/AIUtils/colors";

export default function ModelData() {
  const slope = useSelector((state) => state.ai.slope);
  const intercept = useSelector((state) => state.ai.intercept);
  const iterations = useSelector((state) => state.ai.iterations);
  const maxIterations = useSelector((state) => state.ai.maxIterations);
  const learningRate = useSelector((state) => state.ai.learningRate);
  const k = useSelector((state) => state.ai.k);
  const clusters = useSelector((state) => state.ai.clusters);
  const dataPoints = useSelector((state) => state.ai.dataPoints);
  const algoId = useSelector((state) => state.page.algoId);

  const percentage = maxIterations > 0 ? ((iterations / maxIterations) * 100).toFixed(1) : 0;

  // Calculate dots per group for KNN
  const groupCounts = {};
  let classifiedCount = 0;
  let totalGeneratedPoints = 0;
  
  dataPoints.forEach((point) => {
    const group = point.trueClass !== undefined ? point.trueClass : 0;
    if (group !== -2) { // Skip user-added points
      groupCounts[group] = (groupCounts[group] || 0) + 1;
      totalGeneratedPoints++;
      if (point.class !== -1) {
        classifiedCount++;
      }
    }
  });

  const unclassifiedCount = totalGeneratedPoints - classifiedCount;
  const classificationRate = totalGeneratedPoints > 0 ? ((classifiedCount / totalGeneratedPoints) * 100).toFixed(1) : 0;

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
  } else if (algoId === "k-nearest-neighbors") {
    return (
      <div className="flex gap-[1px] font-space border-b-[10px] border-b-green-bg">
        {/* LEFT SIDE: K Value and Metrics */}
        <div className="flex flex-col p-gap border-r-[1px] border-r-border-1 justify-between flex-1">
          <div className="flex justify-between gap-[2rem] text-[15px]">
            <div className="flex gap-[0.2rem] text-text-1 flex-wrap text-[1.3rem]">
              <span className="text-green uppercase">K Value:</span>
              <span className="text-blue">{k}</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
            <div>
              <span className="text-green uppercase">Total Points</span>
            </div>
            <div>
              <span className="text-blue uppercase">{totalGeneratedPoints}</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
            <div>
              <span className="text-green uppercase">Classified</span>
            </div>
            <div>
              <span className="text-blue uppercase">{classifiedCount}</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
            <div>
              <span className="text-green uppercase">Unclassified</span>
            </div>
            <div>
              <span className="text-blue uppercase">{unclassifiedCount}</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
            <div>
              <span className="text-green uppercase">Classification Rate</span>
            </div>
            <div className="flex gap-[0.5rem]">
              <span className="text-blue uppercase">{classificationRate}%</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
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

        {/* RIGHT SIDE: Group Breakdown Table */}
        <div className="flex flex-col p-gap flex-1">
          <div className="text-green uppercase text-[15px] mb-[0.5rem]">Group Breakdown</div>
          <div className="border-[1px] border-border-1 overflow-hidden rounded flex-1">
            <table className="w-full text-[12px] font-space">
              <thead>
                <tr className="bg-border-1">
                  <th className="p-[0.5rem] text-left text-cyan">Group</th>
                  <th className="p-[0.5rem] text-right text-cyan">Dots</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupCounts)
                  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                  .map(([group, count]) => (
                    <tr key={group} className="border-t-[1px] border-t-border-1">
                      <td className="p-[0.5rem] text-left">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: Colors.getGroupColor(parseInt(group)) }}
                        ></span>
                        <span className="text-text-1">Group {parseInt(group) + 1}</span>
                      </td>
                      <td className="p-[0.5rem] text-right text-blue">{count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } else if (algoId === "k-means-clustering") {
    // Calculate cluster stats for K-means
    const clusterCounts = {};
    let totalGeneratedPoints = 0;
    
    dataPoints.forEach((point) => {
      if (point.trueCluster !== undefined) {
        totalGeneratedPoints++;
        const clusterId = point.clusterAssignment !== -1 ? point.clusterAssignment : "unassigned";
        clusterCounts[clusterId] = (clusterCounts[clusterId] || 0) + 1;
      }
    });

    const assignedCount = Object.keys(clusterCounts).reduce((sum, key) => 
      key !== "unassigned" ? sum + clusterCounts[key] : sum, 0
    );
    const unassignedCount = (clusterCounts["unassigned"] || 0);
    const assignmentRate = totalGeneratedPoints > 0 ? ((assignedCount / totalGeneratedPoints) * 100).toFixed(1) : 0;

    return (
      <div className="flex gap-[1px] font-space border-b-[10px] border-b-green-bg">
        {/* LEFT SIDE: Clusters and Metrics */}
        <div className="flex flex-col p-gap border-r-[1px] border-r-border-1 justify-between flex-1">
          <div className="flex justify-between gap-[2rem] text-[15px]">
            <div className="flex gap-[0.2rem] text-text-1 flex-wrap text-[1.3rem]">
              <span className="text-green uppercase">Clusters:</span>
              <span className="text-blue">{clusters}</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
            <div>
              <span className="text-green uppercase">Total Points</span>
            </div>
            <div>
              <span className="text-blue uppercase">{totalGeneratedPoints}</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
            <div>
              <span className="text-green uppercase">Assigned</span>
            </div>
            <div>
              <span className="text-blue uppercase">{assignedCount}</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
            <div>
              <span className="text-green uppercase">Unassigned</span>
            </div>
            <div>
              <span className="text-blue uppercase">{unassignedCount}</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
            <div>
              <span className="text-green uppercase">Assignment Rate</span>
            </div>
            <div className="flex gap-[0.5rem]">
              <span className="text-blue uppercase">{assignmentRate}%</span>
            </div>
          </div>

          <div className="flex justify-between pt-[1rem] text-[15px]">
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

        {/* RIGHT SIDE: Cluster Breakdown Table */}
        <div className="flex flex-col p-gap flex-1">
          <div className="text-green uppercase text-[15px] mb-[0.5rem]">Cluster Assignment</div>
          <div className="border-[1px] border-border-1 overflow-hidden rounded flex-1">
            <table className="w-full text-[12px] font-space">
              <thead>
                <tr className="bg-border-1">
                  <th className="p-[0.5rem] text-left text-cyan">Cluster</th>
                  <th className="p-[0.5rem] text-right text-cyan">Points</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(clusterCounts)
                  .filter(([key]) => key !== "unassigned")
                  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                  .map(([clusterId, count]) => (
                    <tr key={clusterId} className="border-t-[1px] border-t-border-1">
                      <td className="p-[0.5rem] text-left">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: Colors.getGroupColor(parseInt(clusterId)) }}
                        ></span>
                        <span className="text-text-1">Cluster {parseInt(clusterId) + 1}</span>
                      </td>
                      <td className="p-[0.5rem] text-right text-blue">{count}</td>
                    </tr>
                  ))}
                {clusterCounts["unassigned"] && clusterCounts["unassigned"] > 0 && (
                  <tr className="border-t-[1px] border-t-border-1 bg-border-1">
                    <td className="p-[0.5rem] text-left">
                      <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#9CA3AF" }}></span>
                      <span className="text-text-1">Unassigned</span>
                    </td>
                    <td className="p-[0.5rem] text-right text-blue">{clusterCounts["unassigned"]}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
