import { useProfileStore } from "@/store/useProfileStore";
import { calculateAge } from "@/utils/dateUtils";
import Image from "next/image";
import React from "react";
import SocialLinks from "./SocialLinks";

interface NameSocialBarInput {
  setSettingModalStatus: (status: boolean) => void;
}
function NameSocialBar({ setSettingModalStatus }: NameSocialBarInput) {
  const store = useProfileStore();
  if (!store.userProfile) return <div>Cant find store.userProfile</div>;

  return (
    <div className="flex flex-col gap-1 mt-4 sm:mt-0   ">
      <div className="flex-col sm:flex sm:flex-row sm:justify-center sm:items-start   sm:gap-2.5  w-full">
        <div className="flex gap-2.5 justify-center sm:justify-start items-center    w-full">
          <div className="font-family-helvetica  text-2xl font-medium sm:font-normal sm:text-3xl w-fit">
            {store.userProfile.name}
          </div>

          <div className="w-2 h-2 rounded-full bg-[#d9d9d9]" />
          <div className="text-2xl  sm:text-2xl font-family-helvetica font-medium">
            {calculateAge(store.userProfile.birthDate)}
          </div>

          {store.canEdit && (
            <div
              onClick={() => setSettingModalStatus(true)}
              className="w-10 h-10 ml-2 cursor-pointer hidden  rounded-md bg-white/5 border-[0.5px] border-[#E0DEDE]/20 shadow-[inset_1px_1px_4px_0_rgba(255,244,244,0.25)] hover:shadow-[inset_2px_2px_4px_0_rgba(255,244,244,0.25),0_2px_2px_0_rgba(255,255,255,0.2)] transition-shadow duration-200 sm:flex justify-center items-center"
            >
              <Image src="/Gear.svg" alt="gear" width={25} height={25} />
            </div>
          )}
        </div>

        <div className="font-family-helvetica mb-3   text-center  sm:hidden text-md font-medium -translate-y-1">
          {store.userProfile.location}
        </div>
        <SocialLinks />
      </div>
      <div className="font-family-helvetica hidden sm:block text-[16px] font-medium -translate-y-1">
        {store.userProfile.location}
      </div>
    </div>
  );
}

export default NameSocialBar;
