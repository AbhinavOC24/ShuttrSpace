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

  return (
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
                onClick={() => uploadFiles(slug)}
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
  );
};

export default UploadImageModal;
