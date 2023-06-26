import React from "react";
import Link from "next/link";

const NavHeader = () => {
  return (
    <div
      id="nav-header"
      className="sticky top-0 left-0 border-b-2 border-border-1 flex justify-center w-full"
    >
      <div className="flex flex-col py-7 gap-1">
        <div
          id="algoviz-version"
          className="algoviz-version text-text-2 font-space text-xs transition-all ease-in-out text-center md:text-left"
        >
          v2.1.0
        </div>
        <div className="font-unica text-text-1 text-[3.5rem] leading-[3.5rem]">
          <Link href="/">
            <span>AlgoViz</span>
          </Link>
        </div>
        <div className="text-text-2 font-space text-xs text-center md:text-left">
          Algorithm Visualizer
        </div>
      </div>
    </div>
  );
}

export default NavHeader;