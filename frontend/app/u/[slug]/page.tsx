"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";

import Image from "next/image";

import { useProfileStore } from "@/store/useProfileStore";
import { useProfile } from "@/hooks/useProfile";
import SettingsModal from "./_components/SettingsModal";
import UploadImageModal from "./_components/UploadImageModal";

import Header from "./_components/Header";
import ImageDetails from "./_components/ImageDetails";
function ProfilePage() {
  const store = useProfileStore();

  const [settingModalStatus, setSettingModalStatus] = useState(false);
  useProfile();
  const { slug } = useParams();
  const photosToShow = store.filteredGallery();

  if (store.notFound) {
    return <p>No profile exists for this user.</p>;
  }

  if (!store.userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-[90px] pt-[40px] bg-black text-white">
      <div className="bg-black rounded-lg shadow-lg w-full h-[1000px] flex flex-col gap-[60px]">
        <Header setSettingModalStatus={setSettingModalStatus} />

        <div className="h-full w-full p-[32px] bg-[rgba(255,255,255,0.05)] rounded-[10px] border-[0.5px] border-[#999999]">
          {photosToShow.map((photo, index) => (
            <Image
              key={index}
              src={photo.thumbnailUrl || ""}
              alt={photo.title || `Uploaded ${index}`}
              width={100}
              height={100}
              onClick={() => {
                store.setSelectedImage(photo);
                store.setImageDetailModalStatus(true);
              }}
            />
          ))}
          {store.canEdit && (
            <button
              onClick={() => store.setuploadImageModalStatus(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload Photos
            </button>
          )}
        </div>
      </div>
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
