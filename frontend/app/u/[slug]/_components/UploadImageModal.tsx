"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { useProfileStore } from "@/store/useProfileStore";
import { useUploadFiles } from "@/hooks/useUploadFiles";

import { MAX_UPLOAD_FILES, UPLOAD_TAGS } from "@/constants/upload";

interface UploadImageModalProps {
  slug: string;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({ slug }) => {
  const store = useProfileStore();
  const { uploadFiles } = useUploadFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).slice(0, MAX_UPLOAD_FILES);
    const newQueue = selectedFiles.map((file) => ({
      file,
      title: "",
      tags: [],
      location: "",
      cameraDetails: { cameraname: "", lens: "", aperture: "", iso: "", shutterspeed: "" },
    }));
    store.setUploadQueue(newQueue);
    store.setCurrentIndex(0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_UPLOAD_FILES);
    const newQueue = droppedFiles.map((file) => ({
      file,
      title: "",
      tags: [],
      location: "",
      cameraDetails: { cameraname: "", lens: "", aperture: "", iso: "", shutterspeed: "" },
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

  const closeModal = () => {
    store.setuploadImageModalStatus(false);
    store.resetUploadQueue();
    store.setCurrentIndex(0);
  };

  const updateField = (field: string, value: string) => {
    const updated = [...store.uploadQueue];
    (updated[store.currentIndex] as any)[field] = value;
    store.setUploadQueue(updated);
  };

  const updateCamera = (field: string, value: string) => {
    const updated = [...store.uploadQueue];
    (updated[store.currentIndex].cameraDetails as any)[field] = value;
    store.setUploadQueue(updated);
  };

  const toggleTag = (tag: string) => {
    const updated = [...store.uploadQueue];
    const tags = updated[store.currentIndex].tags;
    updated[store.currentIndex].tags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];
    store.setUploadQueue(updated);
  };

  if (!store.uploadImageModalStatus || !store.canEdit) return null;

  const current = store.uploadQueue[store.currentIndex];
  const isEmpty = store.uploadQueue.length === 0;
  const isLast = store.currentIndex === store.uploadQueue.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal */}
      <div className="relative w-full max-w-[960px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-white font-family-helvetica font-medium text-sm">Upload Photos</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/40 font-mono">
              {store.uploadQueue.length}/{MAX_UPLOAD_FILES} files
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isEmpty && (
              <span className="text-white/30 text-xs font-mono">
                {store.currentIndex + 1} / {store.uploadQueue.length}
              </span>
            )}
            <button
              onClick={closeModal}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {isEmpty ? (
            /* ── Drop Zone ── */
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center h-72 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/25 hover:bg-white/[0.02] transition-all duration-300 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/8 transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-white/70 text-sm font-medium mb-1">Drop images here or <span className="text-white underline underline-offset-2 decoration-white/30">browse</span></p>
              <p className="text-white/25 text-xs">Up to {MAX_UPLOAD_FILES} images · JPG, PNG, WebP</p>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleChange}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>
          ) : (
            /* ── Editor ── */
            <div className="flex gap-6">
              {/* Left — image preview + thumbnail strip */}
              <div className="flex flex-col gap-3 shrink-0">
                <div className="relative w-[340px] h-[420px] rounded-xl overflow-hidden border border-white/10 bg-[#111]">
                  <Image
                    src={URL.createObjectURL(current.file)}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {/* File badge */}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                    <p className="text-white/50 text-[10px] font-mono truncate max-w-[120px]">{current.file.name}</p>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {store.uploadQueue.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ maxWidth: 340 }}>
                    {store.uploadQueue.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => store.setCurrentIndex(i)}
                        className={`relative w-[52px] h-[52px] rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === store.currentIndex ? "border-white/60" : "border-white/10 opacity-50 hover:opacity-80"}`}
                      >
                        <Image src={URL.createObjectURL(item.file)} alt="" fill unoptimized className="object-cover" />
                      </button>
                    ))}
                    {store.uploadQueue.length < MAX_UPLOAD_FILES && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-[52px] h-[52px] rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-white/30 hover:border-white/25 hover:text-white/50 transition-all shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                    )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" onChange={handleChange} multiple accept="image/*" className="hidden" />
              </div>

              {/* Right — metadata form */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">

                {/* Title + Location */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Title", field: "title", placeholder: "e.g. Golden Hour at Jaipur", value: current.title },
                    { label: "Location", field: "location", placeholder: "e.g. Jaipur, India", value: current.location || "" },
                  ].map(({ label, field, placeholder, value }) => (
                    <div key={field} className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateField(field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-all"
                      />
                    </div>
                  ))}
                </div>

                {/* Camera Details */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Camera Settings</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "cameraname", placeholder: "Camera (e.g. Sony A7 IV)" },
                      { key: "lens", placeholder: "Lens (e.g. 85mm f/1.8)" },
                      { key: "aperture", placeholder: "Aperture (e.g. f/2.8)" },
                      { key: "iso", placeholder: "ISO (e.g. 100)" },
                      { key: "shutterspeed", placeholder: "Shutter (e.g. 1/1000)" },
                    ].map(({ key, placeholder }) => (
                      <input
                        key={key}
                        type="text"
                        value={(current.cameraDetails as any)[key]}
                        onChange={(e) => updateCamera(key, e.target.value)}
                        placeholder={placeholder}
                        className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {UPLOAD_TAGS.map((tag) => {
                      const active = current.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                            active
                              ? "bg-white text-black border-white"
                              : "bg-white/5 text-white/50 border-white/10 hover:border-white/25 hover:text-white/80"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Limit notice */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400/60 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-amber-400/60 text-[11px]">Maximum <strong>{MAX_UPLOAD_FILES} images</strong> per upload session. Larger batches can be uploaded separately.</p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <button
                    onClick={prevPhoto}
                    disabled={store.currentIndex === 0}
                    className="px-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 transition-all disabled:opacity-0 disabled:pointer-events-none"
                  >
                    ← Previous
                  </button>

                  <div className="flex gap-2">
                    {!isLast && (
                      <button
                        onClick={nextPhoto}
                        className="px-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                      >
                        Next →
                      </button>
                    )}
                    <button
                      onClick={() => uploadFiles(slug)}
                      disabled={store.uploading || store.uploadQueue.length === 0}
                      className="px-5 py-2 text-sm rounded-lg bg-white text-black font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {store.uploading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        `Upload ${store.uploadQueue.length > 1 ? `all ${store.uploadQueue.length}` : ""}`
                      )}
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
