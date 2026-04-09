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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#121212] rounded-[30px] w-full max-w-4xl h-fit max-h-[90vh] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-2xl font-family-neue font-bold text-white">
            {store.uploadQueue.length === 0 ? "Upload Photos" : "Photo Details"}
          </h2>
          <button
            type="button"
            onClick={() => {
              store.setuploadImageModalStatus(false);
              store.resetUploadQueue();
              store.setCurrentIndex(0);
            }}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {store.uploadQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg text-white font-medium">Select images to upload</p>
                <p className="text-sm text-gray-500 mt-1">High quality photography only</p>
              </div>
              <input
                type="file"
                id="file-upload"
                onChange={handleChange}
                multiple
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all shadow-lg active:scale-95"
              >
                Choose Files
              </label>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
              {/* Image Preview */}
              <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                  <Image
                    src={URL.createObjectURL(store.uploadQueue[store.currentIndex].file)}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-bold">
                    {store.currentIndex + 1} / {store.uploadQueue.length}
                  </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="w-full md:w-1/2 flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Title</label>
                    <input
                      type="text"
                      value={store.uploadQueue[store.currentIndex].title}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].title = e.target.value;
                        store.setUploadQueue(updated);
                      }}
                      placeholder="Wild Desert"
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Location</label>
                    <input
                      type="text"
                      value={store.uploadQueue[store.currentIndex].location || ""}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].location = e.target.value;
                        store.setUploadQueue(updated);
                      }}
                      placeholder="Leh, Ladakh"
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Camera Gear & Settings</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={store.uploadQueue[store.currentIndex].cameraDetails.cameraname}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].cameraDetails.cameraname = e.target.value;
                        store.setUploadQueue(updated);
                      }}
                      placeholder="Camera body"
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="text"
                      value={store.uploadQueue[store.currentIndex].cameraDetails.lens}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].cameraDetails.lens = e.target.value;
                        store.setUploadQueue(updated);
                      }}
                      placeholder="Lens used"
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={store.uploadQueue[store.currentIndex].cameraDetails.aperture}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].cameraDetails.aperture = e.target.value;
                        store.setUploadQueue(updated);
                      }}
                      placeholder="f/1.8"
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white text-center focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="text"
                      value={store.uploadQueue[store.currentIndex].cameraDetails.iso}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].cameraDetails.iso = e.target.value;
                        store.setUploadQueue(updated);
                      }}
                      placeholder="ISO 100"
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white text-center focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="text"
                      value={store.uploadQueue[store.currentIndex].cameraDetails.shutterspeed}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].cameraDetails.shutterspeed = e.target.value;
                        store.setUploadQueue(updated);
                      }}
                      placeholder="1/1000s"
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white text-center focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {["Abstract", "Street", "Portrait", "Landscape", "Night", "Macro"].map((tag) => {
                      const isSelected = store.uploadQueue[store.currentIndex].tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const updated = [...store.uploadQueue];
                            const currentTags = updated[store.currentIndex].tags;
                            updated[store.currentIndex].tags = isSelected
                              ? currentTags.filter((t) => t !== tag)
                              : [...currentTags, tag];
                            store.setUploadQueue(updated);
                          }}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            isSelected
                              ? "bg-white text-black border-white shadow-lg scale-105"
                              : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {store.uploadQueue.length > 0 && (
          <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
            <button
              onClick={prevPhoto}
              disabled={store.currentIndex === 0 || store.uploading}
              className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-white disabled:opacity-0 transition-all"
            >
              Previous
            </button>
            <button
              onClick={store.currentIndex !== store.uploadQueue.length - 1 ? nextPhoto : () => uploadFiles(slug)}
              disabled={store.uploading}
              className="bg-white text-black px-10 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {store.uploading ? "Uploading..." : store.currentIndex !== store.uploadQueue.length - 1 ? "Next Image" : "Finish & Upload"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImageModal;
