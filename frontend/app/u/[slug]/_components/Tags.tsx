import { useProfileStore } from "@/store/useProfileStore";
import React from "react";

function Tags() {
  const store = useProfileStore();
  if (!store.userProfile) return <div>Cant find store.userProfile</div>;

  return (
    <div className="flex flex-col gap-[6px] ">
      <div className="text-2xl text-center sm:text-start  sm:text-base font-family-helvetica font-medium sm:text-[#8A8A8A]">
        Sort By
      </div>
      <div className="flex justify-center sm:justify-start items-center gap-[12px]">
        {/* <div
        key="collections"
        onClick={() => store.toggleTag("collections")}
        className={`${
          store.selectedTags.includes("collections")
            ? "bg-white text-black border-[0.5px] border-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
            : "border-[#4d4d4d] text-white border-[0.5px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)]"
        } cursor-pointer gap-[6px] h-[30px] px-[12px] py-[2px] flex items-center rounded-[10px] transition-colors`}
      >
        <div
          className={`w-[5px] h-[5px]  rounded-full ${
            store.selectedTags.includes("collections")
              ? "bg-black"
              : "bg-white"
          } transition-colors`}
        ></div>
        <span className="font-family-neue font-medium text-[14px]">
          Collections
        </span>
      </div> */}
        {/* <div className="w-px h-[30px] bg-gray-400"></div> */}
        <div className="flex flex-wrap gap-[6px]">
          {store.userProfile.tags.map((tag, idx) => {
            const isSelected = store.selectedTags.includes(tag);
            return (
              <div
                key={idx}
                onClick={() => store.toggleTag(tag)}
                className={`${
                  isSelected
                    ? "bg-white text-black border-[0.5px] border-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
                    : "border-[#4d4d4d] text-white border-[0.5px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)]"
                } cursor-pointer gap-[6px] h-[30px] px-[12px] py-[2px] flex items-center rounded-[10px] transition-colors`}
              >
                <div
                  className={`w-[5px] h-[5px] rounded-full ${
                    isSelected ? "bg-black" : "bg-white"
                  }`}
                ></div>
                <span className="font-family-neue font-medium text-[14px]">
                  {tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Tags;
