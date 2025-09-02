import React from "react";
import SocialLinks from "./SocialLinks";
import { useProfileStore } from "@/store/useProfileStore";
import Image from "next/image";

import { calculateAge } from "@/utils/dateUtils";
import NameSocialBar from "./NameSocialBar";
import Tags from "./Tags";
type HeaderProps = {
  setSettingModalStatus: (status: boolean) => void;
};

function Header({ setSettingModalStatus }: HeaderProps) {
  const store = useProfileStore();
  if (!store.userProfile) return <div>Cant find store.userProfile</div>;
  return (
    <div className="flex flex-col  items-center sm:flex-row sm:items-start  sm:gap-5 ">
      <div className=" h-80 w-80 sm:w-3xs sm:h-64 rounded-[20px] overflow-hidden ">
        <img
          src={store.userProfile.profilePic}
          alt={store.userProfile.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex  w-full  flex-col  flex-1 gap-16 sm:gap-0">
        <div className="flex flex-col gap-8   sm:gap-2 ">
          <NameSocialBar setSettingModalStatus={setSettingModalStatus} />

          <div className="antialiased text-center sm:text-start text-white sm:w-[571px] sm:h-[107px] font-family-neue font-medium text-xl sm:leading-6 ">
            {store.userProfile.bio}
          </div>
        </div>
        <Tags />
      </div>
    </div>
  );
}

export default Header;
