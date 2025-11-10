import GenerationData from "./GenerationData";
import AliveCellsData from "./AliveCellsData";
import IterationsData from "./IterationsData";

const Stats = () => {
  return (
    <div className="relative flex flex-row flex-wrap lg:grid lg:grid-cols-threeStatsLayout border-[1px] border-border-1 mt-gap select-none">
      <GenerationData />
      <AliveCellsData />
      <IterationsData />
    </div>
  );
};

export default Stats;
