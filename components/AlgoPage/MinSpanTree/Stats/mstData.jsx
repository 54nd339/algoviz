import { useSelector } from "react-redux";

export default function MstData() {
  const nodes = useSelector((s) => s.graph.nodes);
  const mstEdges = useSelector((s) => s.graph.mstEdges);
  const mstWeight = useSelector((s) => s.graph.mstWeight);

  const expectedEdges = Math.max(0, (nodes?.length || 0) - 1);
  const percent = expectedEdges > 0 ? Math.round((mstEdges.length / expectedEdges) * 100) : 0;

  return (
    <div className="flex flex-col font-space p-gap border-r-[1px] border-r-border-1 justify-between border-b-[10px] border-b-cyan-bg overflow-x-auto">
      <div className="flex justify-between gap-[2rem] text-[15px]">
        <div className="flex gap-[0.5rem] text-text-1 flex-wrap text-[1.1rem] min-w-[320px]" id="mst-summary">
          <span className="text-green">Edges</span>
          <span className="text-cyan">{mstEdges.length}</span>
          <span className="text-green">of</span>
          <span className="text-blue">{expectedEdges}</span>
        </div>
        <div className="text-green uppercase flex gap-gap">
          Progress <span className="text-cyan">{percent}%</span>
        </div>
      </div>
      <div className="flex justify-between pt-[3rem] text-[15px]">
        <div>
          <span className="text-green uppercase">Minimum Spanning Tree</span>
        </div>
        <div className="flex gap-[1rem]">
          <div className="flex gap-[0.5rem]">
            <span className="text-green uppercase">Total Weight</span>
            <span className="text-blue uppercase" id="mst-weight">{mstWeight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
