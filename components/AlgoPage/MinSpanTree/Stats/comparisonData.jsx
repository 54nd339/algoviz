import { useSelector } from "react-redux";

export default function ComparisonData() {
  const nodes = useSelector((s) => s.graph.nodes);
  const edges = useSelector((s) => s.graph.edges);
  const mstEdges = useSelector((s) => s.graph.mstEdges);

  const expectedEdges = Math.max(0, (nodes?.length || 0) - 1);

  return (
    <div className="hidden lg:flex flex-col h-full font-space p-gap uppercase justify-between border-b-[10px] border-b-green-bg border-r-[1px] border-r-border-1 overflow-x-auto">
      <div className="flex flex-col min-w-[300px]">
        <div className="text-purple">
          Graph Edges <span className="text-green">{edges.length}</span>
        </div>
        <div className="text-text-1 text-[2.4rem]">
          <span>{mstEdges.length}</span>/<span>{expectedEdges}</span>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="text-green">MST Edges</div>
        <div className="text-green">
          Expected <span className="text-blue" id="expected-edges">{expectedEdges}</span>
        </div>
      </div>
    </div>
  );
}
