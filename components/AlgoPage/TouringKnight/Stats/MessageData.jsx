import React from "react";
import { useSelector } from "react-redux";

const MessageData = () => {
  const message = useSelector((state) => state.touringKnight.message);

  return (
    <div className="flex flex-col gap-[1rem] border-[1px] border-border-1 px-[2rem] py-[1.5rem] text-text-1 font-space uppercase">
      <div className="text-center text-green text-[1.1rem] tracking-wide">
        Status
      </div>
      <div className="flex flex-col gap-[0.75rem] text-[0.95rem]">
        <span className="text-cyan text-center">{message}</span>
      </div>
    </div>
  );
};

export default MessageData;
