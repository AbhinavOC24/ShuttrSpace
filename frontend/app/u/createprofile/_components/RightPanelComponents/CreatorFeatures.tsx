import { useAuthStore } from "@/store/useAuthStore";

const CREATOR_FEATURES = {
  upper: ["Street", "Nature", "Portrait"],
  lower: ["Night", "Commercial", "Landscape"],
};

const CreatorFeatures = () => {
  const { formData, toggleTag } = useAuthStore();

  return (
    <div className="flex flex-col gap-2.5 bottom-0 w-full">
      <div className="text-[16px] font-family-neue font-medium leading-[normal] self-stretch mt-[-1px]">
        Select your niche
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex  gap-[4px]">
          {CREATOR_FEATURES.upper.map((content, i) => (
            <FeatureTag
              key={i}
              content={content}
              isSelected={formData.tags.includes(content)}
              onClick={() => toggleTag(content)}
            />
          ))}
        </div>
        <div className="flex gap-[4px]">
          {CREATOR_FEATURES.lower.map((content, i) => (
            <FeatureTag
              key={i}
              content={content}
              isSelected={formData.tags.includes(content)}
              onClick={() => toggleTag(content)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const FeatureTag = ({
  content,
  isSelected,
  onClick,
}: {
  content: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <div
    className={`${
      isSelected ? "special-creator-border" : "creator-border"
    } cursor-pointer transition-colors flex gap-[4px]`}
    onClick={onClick}
  >
    <div
      className={`h-[4px] w-[4px] rounded-full ${
        !isSelected ? "bg-[#4e4e4e]" : "bg-black"
      }`}
    ></div>

    <span
      className={`font-family-neue font-medium text-[12px] whitespace-nowrap ${
        isSelected ? "text-black" : "text-[#4e4e4e]"
      }`}
    >
      {content}
    </span>
  </div>
);

export default CreatorFeatures;
