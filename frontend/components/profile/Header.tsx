import React from "react";
import { useProfileStore } from "@/store/useProfileStore";
import NameSocialBar from "./NameSocialBar";
import Tags from "./Tags";

type HeaderProps = {
  setSettingModalStatus: (status: boolean) => void;
};

function Header({ setSettingModalStatus }: HeaderProps) {
  const store = useProfileStore();
  if (!store.userProfile) return null;

  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-8 w-full">
      {/* Profile Picture */}
      <div className="h-56 w-56 sm:w-64 sm:h-64 rounded-[30px] overflow-hidden flex-shrink-0">
        <img
          src={store.userProfile.profilePic || "/placeholder-user.jpg"}
          alt={store.userProfile.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Content */}
      <div className="flex w-full flex-col flex-1 gap-8 sm:gap-4 mt-6 sm:mt-0">
        <div className="flex flex-col gap-4 sm:gap-2">
          <NameSocialBar setSettingModalStatus={setSettingModalStatus} />

          <div className="antialiased text-center sm:text-start text-white/70 max-w-[571px] font-family-neue font-medium text-lg sm:text-xl sm:leading-6">
            {store.userProfile.bio}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center sm:items-start">
          <span className="text-[12px] uppercase tracking-widest text-white/30 font-bold ml-1">Sort By</span>
          <Tags />
        </div>
      </div>
    </div>
  );
}

export default Header;
