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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-16 lg:px-24 pt-8 sm:pt-12 pb-24 bg-black text-white">
      <div className="w-full flex flex-col gap-10">
        <Header setSettingModalStatus={setSettingModalStatus} />

        <div className="w-full p-4 sm:p-8 bg-white/[0.04] rounded-2xl border border-white/10 sm:columns-[320px]">
          {photosToShow.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center col-span-full">
              <p className="text-white/20 font-family-neue font-medium text-lg tracking-widest uppercase">
                No captures shared yet
              </p>
            </div>
          ) : (
            photosToShow.map((photo, index) => (
              <div
                key={index}
                className="relative mb-4 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => {
                  store.setSelectedImage(photo);
                  store.setImageDetailModalStatus(true);
                }}
              >
                {/* The image — zooms in on hover */}
                <Image
                  src={photo.thumbnailUrl || ""}
                  alt={photo.title || `Uploaded ${index}`}
                  width={500}
                  height={500}
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                {/* Gradient overlay — fades in on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out" />

                {/* Title + location — slides up on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out">
                  {photo.title && (
                    <p className="text-white font-family-helvetica font-medium text-sm leading-tight truncate">
                      {photo.title}
                    </p>
                  )}
                  {photo.location && (
                    <p className="text-white/60 font-family-neue text-xs mt-0.5 flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {photo.location}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
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
