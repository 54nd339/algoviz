import { useSelector } from "react-redux";

const EvaluationData = () => {
  const evaluated = useSelector((state) => state.minimax.evaluatedCount);
  const pruned = useSelector((state) => state.minimax.prunedCount);
  const path = useSelector((state) => state.minimax.selectedPath);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Evaluation Summary
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Nodes Evaluated
          <span className="text-blue">{evaluated}</span>
        </span>
        <span className="flex justify-between">
          Nodes Pruned
          <span className="text-red">{pruned}</span>
        </span>
        <span className="flex justify-between">
          Optimal Path Length
          <span className="text-purple">{path.length}</span>
        </span>
      </div>
    </div>
  );
};

export default EvaluationData;

