import generateTree from "../MinimaxUtils/generateTree";

const GenerateButton = () => {
  return (
    <div
      className="relative w-full h-full lg:max-w-[220px] bg-blue-bg flex justify-center items-center text-text-1 font-space uppercase select-none border-l-[10px] border-blue text-[1rem] md:text-lg hover:cursor-pointer hover:bg-blue hover:text-bg-1 leading-[105%]"
      onClick={() => {
        generateTree();
      }}
    >
      Generate Tree
    </div>
  );
};

export default GenerateButton;

