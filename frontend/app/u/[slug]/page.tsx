"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";

import Image from "next/image";

import { calculateAge } from "@/utils/dateUtils";

import { useProfileStore } from "@/store/useProfileStore";
import { useProfile } from "@/hooks/useProfile";
import { useUploadFiles } from "@/hooks/useUploadFiles";
import SettingsModal from "./_components/SettingsModal";
import gear from "@public/Gear.svg";
import instagram from "@public/Instagram.svg";
import linkedin from "@public/linkedin.svg";
import x from "@public/x.svg";
import email from "@public/google.svg";

function ProfilePage() {
  const store = useProfileStore();
  const [uploadToBlockChain, setUploadToBlockChain] = useState<boolean>(false);
  const [settingModalStatus, setSettingModalStatus] = useState(false);
  useProfile();
  const { uploadFiles } = useUploadFiles();
  const { slug } = useParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newQueue = selectedFiles.map((file) => ({
      file,
      title: "",
      tags: [],
    }));
    store.setUploadQueue(newQueue);
    store.setCurrentIndex(0);
  };

  const nextPhoto = () => {
    if (store.currentIndex < store.uploadQueue.length - 1) {
      store.setCurrentIndex(store.currentIndex + 1);
    } else {
      uploadFiles(slug as string);
    }
  };

  const prevPhoto = () => {
    if (store.currentIndex > 0) store.setCurrentIndex(store.currentIndex - 1);
  };

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
                      <Image src={gear} alt="gear" width={25} height={25} />
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
              <div className="text-[16px] font-family-neue font-medium text-[#8A8A8A]">
                Sort By
              </div>
              <div className="flex  items-center gap-[12px]">
                <div
                  key="collections"
                  onClick={() => store.toggleTag("collections")}
                  className={`${
                    store.selectedTags.includes("collections")
                      ? "bg-white text-black border-[0.5px] border-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
                      : "border-[#4d4d4d] text-white border-[0.5px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)]"
                  } cursor-pointer gap-[6px] h-[30px] px-[12px] py-[2px] flex items-center rounded-[10px]`}
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
                </div>
                <div className="w-px h-[30px] bg-gray-400"></div>
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
                        } cursor-pointer gap-[8px] px-[14px] py-[2px] flex items-center rounded-[10px] transition-colors`}
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
            <div className="absolute right-0 top-0 flex flex-col gap-[4px]">
              <div className="text-[18px] font-family-helvetica font-medium font-white">
                Socials
              </div>
              <div className="flex gap-[8px]">
                {store.userProfile.twitter && (
                  <a
                    href={store.userProfile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-box twitter-box"
                  >
                    <Image
                      src={x}
                      alt="X (Twitter)"
                      width={18}
                      height={18}
                      className="social-icon twitter-glow"
                    />
                  </a>
                )}

                {store.userProfile.email && (
                  <a
                    href={`mailto:${store.userProfile.email}`}
                    className="social-box email-box"
                  >
                    <Image
                      src={email}
                      alt="Email"
                      width={18}
                      height={18}
                      className="social-icon email-glow"
                    />
                  </a>
                )}

                {store.userProfile.linkedin && (
                  <a
                    href={store.userProfile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-box linkedin-box"
                  >
                    <Image
                      src={linkedin}
                      alt="LinkedIn"
                      width={18}
                      height={18}
                      className="social-icon linkedin-glow"
                    />
                  </a>
                )}

                {store.userProfile.instagram && (
                  <a
                    href={store.userProfile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-box instagram-box"
                  >
                    <Image
                      src={instagram}
                      alt="Instagram"
                      width={24}
                      height={24}
                      className="social-icon instagram-glow"
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="h-full w-full p-[32px] bg-[rgba(255,255,255,0.05)] rounded-[10px] border-[0.5px] border-[#999999]">
          {store.gallery.map((photo, index) => (
            <Image
              key={index}
              src={photo.thumbnailUrl || ""}
              alt={photo.title || `Uploaded ${index}`}
              width={100}
              height={100}
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

      {store.uploadImageModalStatus && store.canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-auto mx-4">
            <h2 className="text-xl font-bold mb-4 text-black">Upload Image</h2>
            <input
              type="file"
              onChange={handleChange}
              multiple
              accept="image/*"
              className="mb-4 w-full text-black"
            />
            {store.uploadQueue[store.currentIndex] && (
              <div className="flex gap-4">
                <Image
                  src={URL.createObjectURL(
                    store.uploadQueue[store.currentIndex].file
                  )}
                  alt="Preview"
                  width={500}
                  height={500}
                  className="border rounded"
                />
                <div className="flex flex-col gap-4 text-black">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="title">Title</label>
                    <input
                      type="text"
                      id="title"
                      value={store.uploadQueue[store.currentIndex].title}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].title = e.target.value;
                        store.setUploadQueue(updated);
                      }}
                      className="border border-black p-2 rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="tags">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      value={store.uploadQueue[store.currentIndex].tags.join(
                        ", "
                      )}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].tags = e.target.value
                          .split(",")
                          .map((t) => t.trim());
                        store.setUploadQueue(updated);
                      }}
                      className="border border-black p-2 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => store.setuploadImageModalStatus(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={prevPhoto}
                disabled={store.currentIndex === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Prev
              </button>
              {store.currentIndex !== store.uploadQueue.length - 1 ? (
                <button
                  onClick={nextPhoto}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => uploadFiles(slug as string)}
                  disabled={store.uploading || store.uploadQueue.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {store.uploading ? "Uploading..." : "Upload"}
                </button>
              )}
            </div>
            {store.uploadQueue.length > 1 && (
              <div className="mt-2 text-sm text-gray-600">
                Image {store.currentIndex + 1} of {store.uploadQueue.length}
              </div>
            )}
          </div>
        </div>
      )}

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
