import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSourceNode } from "@/redux/reducers/graphSlice";

export default function SourceNodeSelector() {
  const dispatch = useDispatch();
  const { nodes } = useSelector((s) => s.graph);
  const sourceNode = useSelector((s) => s.graph.sourceNode);

  return (
    <div className="flex flex-col gap-[0.25rem] justify-center h-full">
      <label className="text-text-1 font-space uppercase text-[0.75rem] leading-none">Source</label>
      <select
        value={sourceNode ?? ""}
        onChange={(e) => dispatch(setSourceNode(e.target.value ? parseInt(e.target.value) : null))}
        className="px-[0.5rem] py-[0.25rem] bg-bg-2 border-[1px] border-border-1 text-text-1 font-space text-[0.85rem] rounded"
      >
        <option value="">None</option>
        {nodes?.map((n) => (
          <option key={n.id} value={n.id}>
            {n.id}
          </option>
        ))}
      </select>
    </div>
  );
}
