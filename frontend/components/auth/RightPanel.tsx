"use client";

import CreatorFeatures from "./RightPanelComponents/page1/CreatorFeatures";
import HeroSection from "./RightPanelComponents/page1/HeroSection";

const RightPanel = () => (
  <div className="w-[490px] relative rounded-5xl">
    <div className="relative flex flex-col gap-6 w-[389px] h-[393px] top-[60px] left-[145px]">
      <HeroSection />
      <CreatorFeatures />
    </div>
  </div>
);

export default RightPanel;
