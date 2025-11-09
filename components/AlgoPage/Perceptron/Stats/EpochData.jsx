import { useSelector } from "react-redux";

const EpochData = () => {
  const currentEpoch = useSelector((state) => state.perceptron.currentEpoch);
  const totalEpochs = useSelector((state) => state.perceptron.totalEpochs);
  const status = useSelector((state) => state.perceptron.status);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Training Progress
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="flex justify-between">
          Epoch
          <span className="text-blue">{currentEpoch} / {totalEpochs}</span>
        </span>
        <span className="flex justify-between">
          Status
          <span className="text-yellow capitalize">{status}</span>
        </span>
      </div>
    </div>
  );
};

export default EpochData;
