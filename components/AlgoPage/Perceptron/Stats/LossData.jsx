import { useSelector } from "react-redux";

const LossData = () => {
  const loss = useSelector((state) => state.perceptron.loss);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Training Metrics
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Current Loss
          <span className="text-blue">{loss.toFixed(4)}</span>
        </span>
      </div>
    </div>
  );
};

export default LossData;
