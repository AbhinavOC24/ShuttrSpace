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
  if (!store.userProfile) return null;

  const age = store.userProfile.birthDate ? calculateAge(store.userProfile.birthDate) : null;
  const isValidAge = age !== null && !isNaN(age);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-4 sm:gap-6 w-full">
        <div className="flex gap-5 justify-center sm:justify-start items-center">
          <div className="font-family-helvetica text-4xl sm:text-5xl font-bold tracking-tight text-white capitalize">
            {store.userProfile.name}
          </div>

          {isValidAge && (
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="text-3xl sm:text-4xl font-family-helvetica font-light text-white/40">
                {age}
              </div>
            </div>
          )}

          {store.canEdit && (
            <div
              onClick={() => setSettingModalStatus(true)}
              className="w-12 h-12 cursor-pointer rounded-2xl bg-white/5 border border-white/10 shadow-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex justify-center items-center group ml-2"
            >
              <Image
                src="/Gear.svg"
                alt="gear"
                width={24}
                height={24}
                className="group-hover:rotate-90 transition-transform duration-500 opacity-70 group-hover:opacity-100 contrast-0 invert"
              />
            </div>
          )}
        </div>

        <div className="hidden sm:block ml-auto">
          <SocialLinks />
        </div>
      </div>

      {/* Location */}
      <div className="font-family-helvetica text-white/40 text-base sm:text-lg tracking-widest uppercase mt-1 flex items-center gap-2 justify-center sm:justify-start">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {store.userProfile.location}
      </div>

      {/* Mobile Social Links */}
      <div className="sm:hidden mt-6 flex justify-center">
        <SocialLinks />
      </div>
    </div>
  );
}

export default NameSocialBar;
