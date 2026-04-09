"use client";
import React from "react";
import Image from "next/image";
import { useProfileStore } from "@/store/useProfileStore";

const ImageDetails = () => {
  const store = useProfileStore();
  const photo = store.selectedImage;

  if (!store.imageDetailModalStatus || !photo) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-8">
      {/* Background click to close */}
      <div 
        className="absolute inset-0 z-0" 
        onClick={() => store.setImageDetailModalStatus(false)} 
      />

      <div className="bg-[#111] rounded-[30px] w-full max-w-5xl h-fit max-h-[90vh] border border-white/10 relative z-10 overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={() => store.setImageDetailModalStatus(false)}
          className="absolute top-6 right-6 z-20 text-white/50 hover:text-white transition-colors p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Photo Section */}
        <div className="w-full md:w-2/3 bg-black/40 flex items-center justify-center p-4 min-h-[300px] md:min-h-[500px]">
          <div className="relative w-full h-full min-h-[300px] md:min-h-[500px] flex items-center justify-center">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/3 p-8 md:p-10 flex flex-col justify-between overflow-y-auto bg-gradient-to-br from-[#151515] to-[#0A0A0A]">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-family-neue font-bold text-white tracking-tight">{photo.title}</h2>
              {photo.location && (
                <div className="flex items-center gap-2 text-white/50 mt-2 font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-sm uppercase tracking-wider">{photo.location}</span>
                </div>
              )}
            </div>

            {/* Technical Specs */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20">Technical Specs</h3>
               <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: "Camera", value: photo.cameraname },
                    { label: "Lens", value: photo.lens },
                    { label: "Aperture", value: photo.aperture ? `ƒ/${photo.aperture}` : null },
                    { label: "Shutter", value: photo.shutterspeed },
                    { label: "ISO", value: photo.iso },
                  ].map((spec, i) => spec.value && (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-white/40 text-sm">{spec.label}</span>
                      <span className="text-white font-family-neue font-medium">{spec.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20">Categorized As</h3>
              <div className="flex flex-wrap gap-2">
                {photo.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-white/5 text-white/80 text-xs font-bold px-4 py-2 rounded-full border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/5 text-white/20 text-xs font-medium uppercase tracking-widest">
            Captured on {new Date(photo.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetails;
