import { useSelector } from "react-redux";

const AccuracyData = () => {
  const accuracy = useSelector((state) => state.perceptron.accuracy);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Performance
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Current Accuracy
          <span className="text-purple">{(accuracy * 100).toFixed(1)}%</span>
        </span>
      </div>
    </div>
  );
};

export default AccuracyData;
