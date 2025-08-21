import React from "react";
import SocialLinks from "./SocialLinks";
import { useProfileStore } from "@/store/useProfileStore";
import Image from "next/image";

import { calculateAge } from "@/utils/dateUtils";
type HeaderProps = {
  setSettingModalStatus: (status: boolean) => void;
};

function Header({ setSettingModalStatus }: HeaderProps) {
  const store = useProfileStore();
  if (!store.userProfile) return <div>Cant find store.userProfile</div>;
  return (
    <div className="flex gap-[32px]  relative">
      <div className="relative w-[250px] h-[252px] rounded-[20px] overflow-hidden ">
        <img
          src={store.userProfile.profilePic}
          alt={store.userProfile.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-[2px] flex-1">
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col">
            <div className="flex gap-[10px] items-center  w-fit">
              <div className="font-family-helvetica text-[32px]">
                {store.userProfile.name}
              </div>
              <div className="w-2 h-2 rounded-full bg-[#d9d9d9]" />
              <div className="text-[28px] font-family-helvetica font-medium">
                {calculateAge(store.userProfile.birthDate)}
              </div>

              {store.canEdit && (
                <div
                  onClick={() => setSettingModalStatus(true)}
                  className="w-10 h-10 ml-2 cursor-pointer rounded-md bg-white/5 border-[0.5px] border-[#E0DEDE]/20 shadow-[inset_1px_1px_4px_0_rgba(255,244,244,0.25)] hover:shadow-[inset_2px_2px_4px_0_rgba(255,244,244,0.25),0_2px_2px_0_rgba(255,255,255,0.2)] transition-shadow duration-200 flex justify-center items-center"
                >
                  <Image src="/Gear.svg" alt="gear" width={25} height={25} />
                </div>
              )}
            </div>
            <div className="font-family-helvetica text-[16px] font-medium -translate-y-1">
              {store.userProfile.location}
            </div>
          </div>

          <div className="antialiased text-white w-[571px] h-[107px] font-family-neue font-medium text-[18px] leading-5">
            {store.userProfile.bio}
          </div>
        </div>

        <div className="flex flex-col gap-[6px]">
          <div className="text-[16px] font-family-helvetica font-medium text-[#8A8A8A]">
            Sort By
          </div>
          <div className="flex  items-center gap-[12px]">
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

        {/* Social Links Section - Positioned absolutely on the right */}
        <SocialLinks />
      </div>
    </div>
  );
}

export default Header;
