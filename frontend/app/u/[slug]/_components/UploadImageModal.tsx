"use client";
import React from "react";
import Image from "next/image";
import { useProfileStore } from "@/store/useProfileStore";
import { useUploadFiles } from "@/hooks/useUploadFiles";

interface UploadImageModalProps {
  slug: string;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({ slug }) => {
  const store = useProfileStore();
  const { uploadFiles } = useUploadFiles();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newQueue = selectedFiles.map((file) => ({
      file,
      title: "",
      tags: [],
      location: "",
      cameraDetails: {
        cameraname: "",
        lens: "",
        aperture: "",
        iso: "",
        shutterspeed: "",
      },
    }));
    store.setUploadQueue(newQueue);
    store.setCurrentIndex(0);
  };

  const nextPhoto = () => {
    if (store.currentIndex < store.uploadQueue.length - 1) {
      store.setCurrentIndex(store.currentIndex + 1);
    } else {
      uploadFiles(slug);
    }
  };

  const prevPhoto = () => {
    if (store.currentIndex > 0) store.setCurrentIndex(store.currentIndex - 1);
  };

  if (!store.uploadImageModalStatus || !store.canEdit) {
    return null;
  }

  if (!store.userProfile) return <div>no user profile exist</div>;

  return (
    <div className="fixed inset-0 bg-black/70  flex items-center justify-center z-50 ">
      <div className="bg-[#151515] p-[36px] rounded-[20px] w-[893px] h-[635px]  border border-[#4d4d4d]">
        <div className=" ">
          {/* File Upload Section */}
          {/* {store.uploadQueue.length == 0 && (
            <div className="w-[367px] h-[563px] border border-[#4d4d4d] rounded-[10px] overflow-hidden flex-shrink-0">
              <Image
                src={URL.createObjectURL(
                  store.uploadQueue[store.currentIndex].file
                )}
                alt="Preview"
                width={367}
                height={563}
                className="w-full h-full object-cover"
              />
            </div>
          )} */}
          {/* File Upload Section */}
          {store.uploadQueue.length == 0 && (
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
          )}
          {/* Preview and Form Section */}
          {store.uploadQueue[store.currentIndex] && (
            <div className="flex gap-[36px]">
              <Image
                src={URL.createObjectURL(
                  store.uploadQueue[store.currentIndex].file
                )}
                alt="Preview"
                width={367}
                height={563}
                className="border border-[#4d4d4d] rounded-[10px] object-cover h-[563px] w-[367px] max-w-[367px]"
              />

              <div className="text-[14px] min-w-[417px] flex flex-col relative h-[563px]">
                {/* Cancel button - Top right */}
                <button
                  type="button"
                  onClick={() => {
                    store.setuploadImageModalStatus(false);
                    store.resetUploadQueue();
                    store.setCurrentIndex(0);
                  }}
                  className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors"
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

                {/* Content area - flex-grow to push buttons to bottom */}
                <div className="flex flex-col gap-[30px] flex-grow">
                  {/* Photo details */}
                  <div className="text-[28px] font-family-neue font-medium">
                    Photo Details
                  </div>

                  <div className="flex justify-between w-full">
                    <div className="flex gap-2 flex-col w-[182px]">
                      <label className="text-white font-medium font-family-neue text-[16px]">
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
                        className="w-[185px] p-2 text-[14px] h-[33px] border-[0.5px] rounded-[10px] border-[#4e4e4e] text-white placeholder-[#777676] font-family-neue font-normal focus:outline-none transition-colors bg-transparent"
                      />
                    </div>
                    <div className="flex gap-2 flex-col">
                      <label className="text-white font-medium font-family-neue text-[16px]">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={
                          store.uploadQueue[store.currentIndex].location || ""
                        }
                        onChange={(e) => {
                          const updated = [...store.uploadQueue];
                          updated[store.currentIndex].location = e.target.value;
                          store.setUploadQueue(updated);
                        }}
                        placeholder="Enter location (optional)..."
                        className="w-[185px] p-2 text-[14px] h-[33px] border-[0.5px] rounded-[10px] border-[#4e4e4e] text-white placeholder-[#777676] font-family-neue font-normal focus:outline-none transition-colors bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Camera Details Section */}
                  <div className="flex flex-col gap-[12px]">
                    <div className="text-[16px] font-family-neue font-medium">
                      Camera Details
                    </div>
                    <div className="flex flex-col gap-[14px]">
                      {/* Camera Name and Lens Row */}
                      <div className="flex gap-[32px] justify-between">
                        <input
                          type="text"
                          id="cameraname"
                          value={
                            store.uploadQueue[store.currentIndex].cameraDetails
                              .cameraname
                          }
                          onChange={(e) => {
                            const updated = [...store.uploadQueue];
                            updated[
                              store.currentIndex
                            ].cameraDetails.cameraname = e.target.value;
                            store.setUploadQueue(updated);
                          }}
                          placeholder="Camera name"
                          className="w-[185px] h-[33px] p-2 text-[14px] border-[0.5px] border-[#4e4e4e] rounded-[10px] text-white placeholder-[#777676] font-family-neue font-normal focus:outline-none transition-colors bg-transparent"
                        />
                        <input
                          type="text"
                          id="lens"
                          value={
                            store.uploadQueue[store.currentIndex].cameraDetails
                              .lens
                          }
                          onChange={(e) => {
                            const updated = [...store.uploadQueue];
                            updated[store.currentIndex].cameraDetails.lens =
                              e.target.value;
                            store.setUploadQueue(updated);
                          }}
                          placeholder="Lens"
                          className="w-[185px] h-[33px] p-2 text-[14px] border-[0.5px] border-[#4e4e4e] rounded-[10px] text-white placeholder-[#777676] font-family-neue font-normal focus:outline-none transition-colors bg-transparent"
                        />
                      </div>

                      {/* Aperture, ISO, Shutter Speed Row */}
                      <div className="flex justify-between gap-[10px]">
                        <input
                          type="text"
                          id="aperture"
                          value={
                            store.uploadQueue[store.currentIndex].cameraDetails
                              .aperture
                          }
                          onChange={(e) => {
                            const updated = [...store.uploadQueue];
                            updated[store.currentIndex].cameraDetails.aperture =
                              e.target.value;
                            store.setUploadQueue(updated);
                          }}
                          placeholder="Aperture"
                          className="w-[125px] h-[33px] p-2 text-[14px] border-[0.5px] border-[#4e4e4e] rounded-[10px] text-white placeholder-[#777676] font-family-neue font-normal focus:outline-none transition-colors bg-transparent"
                        />
                        <input
                          type="text"
                          id="iso"
                          value={
                            store.uploadQueue[store.currentIndex].cameraDetails
                              .iso
                          }
                          onChange={(e) => {
                            const updated = [...store.uploadQueue];
                            updated[store.currentIndex].cameraDetails.iso =
                              e.target.value;
                            store.setUploadQueue(updated);
                          }}
                          placeholder="ISO"
                          className="w-[125px] h-[33px] p-2 text-[14px] border-[0.5px] border-[#4e4e4e] rounded-[10px] text-white placeholder-[#777676] font-family-neue font-normal focus:outline-none transition-colors bg-transparent"
                        />
                        <input
                          type="text"
                          id="shutterspeed"
                          value={
                            store.uploadQueue[store.currentIndex].cameraDetails
                              .shutterspeed
                          }
                          onChange={(e) => {
                            const updated = [...store.uploadQueue];
                            updated[
                              store.currentIndex
                            ].cameraDetails.shutterspeed = e.target.value;
                            store.setUploadQueue(updated);
                          }}
                          placeholder="ShutterSpeed"
                          className="w-[125px] h-[33px] p-2 text-[14px] border-[0.5px] border-[#4e4e4e] rounded-[10px] text-white placeholder-[#777676] font-family-neue font-normal focus:outline-none transition-colors bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags Section */}
                  <div className="flex flex-col gap-[12px]">
                    <div className="text-[16px] font-family-neue font-medium">
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-[6px]">
                      {[
                        "Abstract",
                        "Street",
                        "Portrait",
                        "Landscape",
                        "Night",
                      ].map((tag, idx) => {
                        const isSelected =
                          store.uploadQueue[store.currentIndex].tags.includes(
                            tag
                          );
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              const updated = [...store.uploadQueue];
                              const currentTags =
                                updated[store.currentIndex].tags;
                              if (currentTags.includes(tag)) {
                                updated[store.currentIndex].tags =
                                  currentTags.filter((t) => t !== tag);
                              } else {
                                updated[store.currentIndex].tags = [
                                  ...currentTags,
                                  tag,
                                ];
                              }
                              store.setUploadQueue(updated);
                            }}
                            className={`${
                              isSelected
                                ? "bg-white text-black border-[0.5px] border-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
                                : "border-[#4d4d4d] text-white border-[0.5px] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3)]"
                            } cursor-pointer gap-[6px] h-[30px] px-[10px] py-[5px] flex items-center rounded-[10px] transition-colors`}
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

                {/* Action Buttons - Fixed at bottom */}
                <div className="flex w-full justify-between items-end">
                  {/* Left side - Previous button with consistent height */}
                  <div className="w-[105px] h-[37px]">
                    {store.currentIndex > 0 && (
                      <button
                        onClick={prevPhoto}
                        className="bg-black border border-[#414141] rounded-[10px] w-full h-full text-white shadow-[0_-4px_4px_0_rgba(0,0,0,0.25)] shadow-[inset_4px_6px_4.2px_rgba(255,255,255,0.105)] transition-colors"
                      >
                        Previous
                      </button>
                    )}
                  </div>

                  {/* Right side - Next/Upload button with consistent position */}
                  <div className="w-[105px] h-[37px]">
                    <button
                      onClick={
                        store.currentIndex !== store.uploadQueue.length - 1
                          ? nextPhoto
                          : () => uploadFiles(slug)
                      }
                      disabled={
                        store.uploading || store.uploadQueue.length === 0
                      }
                      className="bg-black border w-full h-full cursor-pointer border-[#414141] rounded-[10px] text-white shadow-[0_-4px_4px_0_rgba(0,0,0,0.25)] shadow-[inset_4px_6px_4.2px_rgba(255,255,255,0.105)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {store.uploading
                        ? "Uploading..."
                        : store.currentIndex !== store.uploadQueue.length - 1
                        ? "Next"
                        : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadImageModal;
