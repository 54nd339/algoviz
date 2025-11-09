import { useSelector } from "react-redux";

function ShortestPathStats() {
  const { sourceNode, distances, allDistances, nodes, edges } = useSelector((s) => s.graph);
  const algoName = useSelector((s) => s.page.algoName || "");

  const isFloydWarshall = algoName.toLowerCase().includes("floyd");

  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-2 border-[1px] border-border-1 mt-gap select-none">
      <div className="flex flex-col font-space p-gap border-r-[1px] border-r-border-1 justify-between border-b-[10px] border-b-cyan-bg overflow-x-auto w-1/2 lg:w-auto">
        <div className="flex justify-between gap-[2rem] text-[15px]">
          <div className="flex gap-[0.5rem] text-text-1 flex-wrap text-[1.1rem] min-w-[320px]">
            <span className="text-green">Algorithm</span>
            <span className="text-blue">{algoName}</span>
          </div>
        </div>

        {isFloydWarshall ? (
          <div className="pt-[1rem] max-h-[400px] overflow-y-auto">
            <div className="text-purple uppercase text-[0.9rem] mb-[1rem]">All-Pairs Distance Matrix:</div>
            <table className="border-collapse text-[0.85rem]">
              <thead>
                <tr>
                  <th className="border-[1px] border-border-1 px-[0.5rem] py-[0.25rem] text-green bg-bg-2 text-center">From\To</th>
                  {nodes?.map((n) => (
                    <th key={n.id} className="border-[1px] border-border-1 px-[0.5rem] py-[0.25rem] text-cyan bg-bg-2 text-center min-w-[3rem]">
                      {n.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodes?.map((fromNode) => (
                  <tr key={fromNode.id}>
                    <td className="border-[1px] border-border-1 px-[0.5rem] py-[0.25rem] text-cyan font-semibold text-center bg-bg-2">
                      {fromNode.id}
                    </td>
                    {nodes?.map((toNode) => {
                      const dist = allDistances?.[fromNode.id]?.[toNode.id];
                      const isInfinite = dist === Infinity || dist === undefined;
                      return (
                        <td
                          key={`${fromNode.id}-${toNode.id}`}
                          className={`border-[1px] border-border-1 px-[0.5rem] py-[0.25rem] text-center ${
                            fromNode.id === toNode.id
                              ? "bg-bg-2 text-text-1 font-semibold"
                              : isInfinite
                              ? "text-red"
                              : "text-blue"
                          }`}
                        >
                          {isInfinite ? "∞" : dist}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="pt-[1rem] max-h-[400px] overflow-y-auto">
            {sourceNode && (<div className="text-purple uppercase text-[0.9rem] mb-[1rem]">
              Distances from Node {sourceNode}:
            </div>)}
            <table className="border-collapse text-[0.85rem]">
              <thead>
                <tr>
                  <th className="border-[1px] border-border-1 px-[0.75rem] py-[0.5rem] text-green bg-bg-2">Destination Node</th>
                  <th className="border-[1px] border-border-1 px-[0.75rem] py-[0.5rem] text-green bg-bg-2">Distance</th>
                </tr>
              </thead>
              <tbody>
                {nodes?.map((node) => {
                  const dist = distances[node.id];
                  const isInfinite = dist === undefined || dist === Infinity;
                  return (
                    <tr key={node.id} className="hover:bg-bg-2">
                      <td className="border-[1px] border-border-1 px-[0.75rem] py-[0.25rem] text-text-1 text-cyan">Node {node.id}</td>
                      <td
                        className={`border-[1px] border-border-1 px-[0.75rem] py-[0.25rem] text-center font-semibold ${
                          isInfinite ? "text-red" : "text-blue"
                        }`}
                      >
                        {isInfinite ? "∞" : dist}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col font-space p-gap justify-between border-b-[10px] border-b-green-bg overflow-x-auto w-1/2 lg:w-auto">
        <div className="flex justify-between gap-[2rem] text-[15px]">
          <div className="flex gap-[0.5rem] text-text-1 flex-wrap text-[1.1rem] min-w-[320px]">
            <span className="text-green">Edges</span>
            <span className="text-blue">{edges?.length || 0}</span>
          </div>
        </div>

        <div className="flex justify-between text-[15px]">
          <div>
            <span className="text-purple uppercase">Graph Edges</span>
          </div>
        </div>

        <div className="pt-[1rem] max-h-[400px] overflow-y-auto">
          <table className="border-collapse text-[0.85rem]">
            <thead>
              <tr>
                <th className="border-[1px] border-border-1 px-[0.5rem] py-[0.25rem] text-green bg-bg-2 text-center">From\To</th>
                {nodes?.map((node) => (
                  <th key={node.id} className="border-[1px] border-border-1 px-[0.5rem] py-[0.25rem] text-cyan bg-bg-2 text-center">
                    {node.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodes?.map((fromNode) => (
                <tr key={fromNode.id}>
                  <td className="border-[1px] border-border-1 px-[0.5rem] py-[0.25rem] text-cyan font-semibold text-center bg-bg-2">{fromNode.id}</td>
                  {nodes?.map((toNode) => {
                    const edge = edges?.find((e) => e.u === fromNode.id && e.v === toNode.id);
                    return (
                      <td key={toNode.id} className={`border-[1px] border-border-1 px-[0.5rem] py-[0.25rem] text-center ${edge ? "text-blue" : "text-red"}`}>
                        {edge ? edge.weight : 0}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ShortestPathStats;
