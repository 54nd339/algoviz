import { useSelector } from "react-redux";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import PrismTheme from "@/utils/PrismTheme";
import Data from "@/public/data/algorithmData.json";

/**
 * Generic AlgoData component that works across all algorithm pages
 * Displays algorithm code, time complexity, and space complexity
 */
const AlgoData = ({ gridLayout = "lg:grid-cols-algoDataLayout" }) => {
  const algoName = useSelector((state) => state.page.algoName);

  if (!algoName) return null;

  let currAlgo = algoName.replace(/ /g, "").replace(/'/g, "").replace(/-/g, "");
  const currAlgoData = Data[currAlgo];

  if (!currAlgoData) return null;

  const ComplexityRow = ({ label, value, color }) => (
    <span className="flex justify-between">
      {label} <span className={color}>{value}</span>
    </span>
  );

  const ComplexityCard = ({ title, data }) => (
    <div className="border-[1px] border-border-1 px-[2rem] py-[1.5rem] flex flex-col gap-[2rem]">
      <div className="uppercase text-center font-space">{title}</div>
      <div className="text-text-1 flex flex-col gap-[1rem] font-space">
        <ComplexityRow label="Best Case" value={data.best} color="text-blue" />
        <ComplexityRow label="Average Case" value={data.average} color="text-blue" />
        <ComplexityRow label="Worst Case" value={data.worst} color="text-red" />
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full h-[150px] bg-green-bg mt-gap font-space text-[1.5rem] lg:text-[2rem] text-text-1 flex items-center uppercase justify-center text-center p-[10px]">
        More About {algoName}
      </div>
      <div className={`flex flex-col lg:grid ${gridLayout} gap-gap my-gap`}>
        <div
          id="algo-code-container"
          className="w-full h-full font-space border-[1px] border-border-1 bg-graphPattern text-[14px]"
        >
          <SyntaxHighlighter
            language="cpp"
            wrapLines={true}
            style={PrismTheme}
            showLineNumbers={true}
          >
            {currAlgoData.code}
          </SyntaxHighlighter>
        </div>
        <div className="w-full h-full font-space text-green flex flex-col gap-gap">
          <ComplexityCard title="Time Complexity" data={currAlgoData.timeComplexity} />
          <ComplexityCard title="Space Complexity" data={currAlgoData.spaceComplexity} />
          {currAlgoData.stable && (
            <div className="border-[1px] border-border-1 px-[2rem] py-[1.5rem] flex flex-col gap-[2rem]">
              <div className="uppercase text-center font-space">Stability</div>
              <div className="text-text-1 text-center uppercase font-space">{currAlgoData.stable}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AlgoData;
