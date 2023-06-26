import { useEffect } from "react";
import { NextSeo } from "next-seo";

import TopBar from "@/components/TopBar";
import Terrain from "@/components/Home/Terrain";
import HeroTitle from "@/components/Home/heroTitle";
import { batch, useDispatch } from "react-redux";
import {
  setAlgoId,
  setAlgoName,
  setAlgoCategory,
} from "@/redux/reducers/pageSlice";

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    batch(() => {
      dispatch(setAlgoId("home"));
      dispatch(setAlgoName("Home"));
      dispatch(setAlgoCategory("home"));
    });
  });

  return (
    <div>
      <NextSeo
        title="Home | Algoviz"
        description="A algorithm visualizer for understanding algorithms"
        canonical={`https://algoviz.vercel.app/`}
        openGraph={{
          url: `https://algoviz.vercel.app/`,
          title: "Home | Algoviz",
          description: "A algorithm visualizer for understanding algorithms",
          profile: {
            firstName: "Sandeep",
            lastName: "Swain",
          },
          images: [
            {
              url: "https://algoviz.vercel.app/social.png",
              width: 800,
              height: 600,
              alt: "Og Image Alt",
              type: "image/jpeg",
            },
          ],
          siteName: "Algoviz",
        }}
        twitter={{
          handle: "@54nd339",
          cardType: "summary_large_image",
        }}
      />
      <div className="p-gap">
        <div className="relative w-[100%] h-[70vh] border-[1px] border-border-1 overflow-hidden">
          <TopBar />
          <div
            id="visualizer-container"
            className="relative h-full overflow-hidden bg-hero bg-cover bg-center bg-no-repeat"
          >
            <HeroTitle />
            <Terrain className="absolute top-[-100%] z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
