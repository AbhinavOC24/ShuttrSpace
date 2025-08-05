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
  const photosToShow = store.filteredGallery();

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
              <div className="text-[16px] font-family-helvetica font-medium text-[#8A8A8A]">
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
          {photosToShow.map((photo, index) => (
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
          <div className="bg-[#151515] p-8 rounded-[20px] w-[800px] max-h-[90vh] overflow-y-auto border border-[#4d4d4d]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Upload Images</h2>
              <button
                onClick={() => store.setuploadImageModalStatus(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="space-y-2">
                <label className="text-white text-sm text-[14px]">
                  Select Images
                </label>
                <input
                  type="file"
                  onChange={handleChange}
                  multiple
                  accept="image/*"
                  className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 w-full"
                />
              </div>

              {/* Preview and Form Section */}
              {store.uploadQueue[store.currentIndex] && (
                <div className="flex gap-6">
                  <div className="flex-1">
                    <Image
                      src={URL.createObjectURL(
                        store.uploadQueue[store.currentIndex].file
                      )}
                      alt="Preview"
                      width={400}
                      height={400}
                      className="border border-[#4d4d4d] rounded-[10px] object-cover w-full h-[400px]"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="text-[14px] flex flex-col gap-[12px]">
                      <label className="text-[#9c9c9c] text-sm text-[14px]">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={store.uploadQueue[store.currentIndex].title}
                        onChange={(e) => {
                          const updated = [...store.uploadQueue];
                          updated[store.currentIndex].title = e.target.value;
                          store.setUploadQueue(updated);
                        }}
                        placeholder="Enter image title..."
                        className="w-full px-4 py-3 text-[14px] h-[38px] border-[0.5px] border-[#4d4d4d] rounded-[10px] text-white placeholder-gray-400 focus:outline-none transition-colors bg-transparent"
                      />
                    </div>

                    <div className="text-[14px] flex flex-col gap-[12px]">
                      <label className="text-[#9c9c9c] text-sm text-[14px]">
                        Tags
                      </label>
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
                        placeholder="Enter tags separated by commas..."
                        className="w-full px-4 py-3 text-[14px] h-[38px] border-[0.5px] border-[#4d4d4d] rounded-[10px] text-white placeholder-gray-400 focus:outline-none transition-colors bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {store.uploadQueue.length > 1 && (
                <div className="text-center text-sm text-gray-400">
                  Image {store.currentIndex + 1} of {store.uploadQueue.length}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => store.setuploadImageModalStatus(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-[10px] hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={prevPhoto}
                  disabled={store.currentIndex === 0}
                  className="px-4 py-3 bg-gray-600 text-white rounded-[10px] hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {store.currentIndex !== store.uploadQueue.length - 1 ? (
                  <button
                    onClick={nextPhoto}
                    className="px-4 py-3 bg-white text-black rounded-[10px] hover:bg-gray-100 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => uploadFiles(slug as string)}
                    disabled={store.uploading || store.uploadQueue.length === 0}
                    className="px-4 py-3 bg-white text-black rounded-[10px] hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {store.uploading ? "Uploading..." : "Upload Images"}
                  </button>
                )}
              </div>
            </div>
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
