import { useSelector } from "react-redux";

const ConfigData = () => {
  const maxDepth = useSelector((state) => state.minimax.maxDepth);
  const branchingFactor = useSelector((state) => state.minimax.branchingFactor);
  const minLeaf = useSelector((state) => state.minimax.minLeafValue);
  const maxLeaf = useSelector((state) => state.minimax.maxLeafValue);
  const status = useSelector((state) => state.minimax.status);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Configuration
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Max Depth
          <span className="text-blue">{maxDepth}</span>
        </span>
        <span className="flex justify-between">
          Branching Factor
          <span className="text-blue">{branchingFactor}</span>
        </span>
        <span className="flex justify-between">
          Leaf Range
          <span className="text-purple">
            [{minLeaf}, {maxLeaf}]
          </span>
        </span>
        <span className="flex justify-between">
          Status
          <span className="text-yellow capitalize">{status}</span>
        </span>
      </div>
    </div>
  );
};

export default ConfigData;

