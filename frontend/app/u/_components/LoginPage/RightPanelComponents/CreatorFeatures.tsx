const CREATOR_FEATURES = {
  upper: ["Tell Stories", "Curate With Purpose", "Want control"],
  lower: ["Value Aesthetics", "Focus On The Timeless"],
};

const CreatorFeatures = () => (
  <div className="flex flex-col gap-2.5 absolute bottom-0 w-full">
    <div className="text-[16px] font-family-neue font-medium leading-[normal] self-stretch mt-[-1px]">
      Built for creators who
    </div>

    <div className="flex flex-col gap-1 ">
      <div className="flex gap-[2px]">
        {CREATOR_FEATURES.upper.map((content, i) => (
          <FeatureTag key={i} content={content} />
        ))}
      </div>
      <div className="flex gap-[2px]">
        {CREATOR_FEATURES.lower.map((content, i) => (
          <FeatureTag key={i} content={content} />
        ))}
        <SpecialFeatureTag content="Treat Their Work Like Art" />
      </div>
    </div>
  </div>
);

const FeatureTag = ({ content }: { content: string }) => (
  <div className="creator-border">
    <span className="font-family-neue font-medium text-[#4e4e4e] text-[12px] whitespace-nowrap">
      {content}
    </span>
  </div>
);

// Special feature tag component
const SpecialFeatureTag = ({ content }: { content: string }) => (
  <span className="special-creator-border">
    <span className="font-family-neue font-medium text-black text-[12px] whitespace-nowrap">
      {content}
    </span>
  </span>
);
export default CreatorFeatures;
