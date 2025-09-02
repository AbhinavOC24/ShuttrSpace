"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import Image from "next/image";

import { useProfileStore } from "@/store/useProfileStore";
import { useProfile } from "@/hooks/useProfile";
import SettingsModal from "./_components/SettingsModal";
import UploadImageModal from "./_components/UploadImageModal";

import Header from "./_components/Header";
import ImageDetails from "./_components/ImageDetails";
import { useRouter } from "next/navigation";
function ProfilePage() {
  const store = useProfileStore();
  const router = useRouter();

  const [settingModalStatus, setSettingModalStatus] = useState(false);
  useProfile();
  const { slug } = useParams();
  const photosToShow = store.filteredGallery();

  useEffect(() => {
    if (store.notFound) {
      router.push("/404");
    }
  }, [store.notFound, router]);

  if (store.notFound) {
    <div className="flex items-center justify-center min-h-screen">
      No profile exists for this user
    </div>;
  }

  if (!store.userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className=" h-screen   flex flex-col items-center px-24  bg-black text-white">
      <div className="bg-black  h-full rounded-lg shadow-lg w-full    flex flex-col gap-[60px]">
        <Header setSettingModalStatus={setSettingModalStatus} />

        <div className="h-fit w-full p-4 sm:p-8 bg-[rgba(255,255,255,0.05)] rounded-[10px] border-[0.5px] border-[#999999] sm:columns-[320px]">
          {photosToShow.map((photo, index) => (
            <Image
              key={index}
              src={photo.thumbnailUrl || ""}
              alt={photo.title || `Uploaded ${index}`}
              width={100}
              height={100}
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full object-contain mb-4"
              onClick={() => {
                store.setSelectedImage(photo);
                store.setImageDetailModalStatus(true);
              }}
            />
          ))}
        </div>
      </div>

      {store.canEdit && (
        <button
          onClick={() => store.setuploadImageModalStatus(true)}
          className="w-20 h-20 rounded-full overflow-hidden bottom-10 right-8 fixed cursor-pointer"
        >
          <div className="group relative w-20 h-20 bg-black rounded-full shadow-[inset_2px_2px_10px_#ffffff] flex justify-center items-center hover:bg-white hover:shadow-[inset_2px_2px_10px_#000000] transition-all duration-200">
            <div className="absolute font-family-helvetica font-bold text-white text-[40px] tracking-[0] leading-normal whitespace-nowrap translate-y-[-3px] group-hover:text-black">
              +
            </div>
          </div>
        </button>
      )}
      {store.imageDetailModalStatus && <ImageDetails />}
      <UploadImageModal slug={slug as string} />

      {/* Settings Modal */}
      {store.canEdit && (
        <SettingsModal
          isOpen={settingModalStatus}
          onClose={() => setSettingModalStatus(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
