"use client";
import React from "react";
import Image from "next/image";
import { useProfileStore } from "@/store/useProfileStore";

const ImageDetails = () => {
  const store = useProfileStore();
  const photo = store.selectedImage;

  if (!store.imageDetailModalStatus || !photo) return null;
  if (!store.userProfile) return null;

  const exifItems = [
    { label: "Camera", value: photo.cameraname, icon: "📷" },
    { label: "Lens", value: photo.lens, icon: "🔭" },
    { label: "Aperture", value: photo.aperture ? `ƒ/${photo.aperture}` : null, icon: "◎" },
    { label: "Shutter", value: photo.shutterspeed, icon: "⏱" },
    { label: "ISO", value: photo.iso, icon: "☀" },
  ].filter((i) => i.value);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && store.setImageDetailModalStatus(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col sm:flex-row"
        style={{ maxHeight: "88vh" }}
      >
        {/* Left — full-bleed image */}
        <div className="relative sm:w-[55%] bg-[#0a0a0a] flex items-center justify-center min-h-[240px] sm:min-h-0">
          <Image
            src={photo.imageUrl}
            alt={photo.title || "Photo"}
            width={800}
            height={900}
            unoptimized
            className="w-full h-full object-contain"
            style={{ maxHeight: "88vh" }}
          />

          {/* Bottom-left gradient with title on image */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4 pointer-events-none">
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">
              {new Date(photo.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Right — details panel */}
        <div className="sm:w-[45%] bg-[#111] flex flex-col overflow-y-auto">
          {/* Header row */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-white/8">
            <div className="flex-1 pr-4">
              <h2 className="text-white font-family-helvetica font-semibold text-xl leading-tight">
                {photo.title || "Untitled"}
              </h2>
              {photo.location && (
                <p className="text-white/40 text-xs mt-1.5 flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {photo.location}
                </p>
              )}
            </div>
            <button
              onClick={() => store.setImageDetailModalStatus(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white transition-all flex-shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Photographer row */}
          <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
              {store.userProfile.profilePic ? (
                <img src={store.userProfile.profilePic} alt={store.userProfile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30 text-sm">
                  {store.userProfile.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium capitalize">{store.userProfile.name}</p>
              <p className="text-white/30 text-[11px]">{store.userProfile.location || "Photographer"}</p>
            </div>
          </div>

          {/* EXIF Data */}
          {exifItems.length > 0 && (
            <div className="px-6 py-4 border-b border-white/8">
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold mb-3">
                Camera Settings
              </p>
              <div className="grid grid-cols-2 gap-2">
                {exifItems.map((item) => (
                  <div key={item.label} className="bg-white/4 border border-white/8 rounded-xl px-3 py-2.5">
                    <p className="text-white/30 text-[9px] uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-white text-sm font-medium font-family-neue">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {photo.tags && photo.tags.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold mb-3">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {photo.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spacer push footer down */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/8">
            <a
              href={photo.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 text-sm transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open in new tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetails;
