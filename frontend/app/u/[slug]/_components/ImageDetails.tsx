"use client";
import React from "react";
import Image from "next/image";
import { useProfileStore } from "@/store/useProfileStore";

const ImageDetails = () => {
  const store = useProfileStore();
  const photo = store.selectedImage;

  if (!store.imageDetailModalStatus || !photo) return null;
  if (!store.userProfile) return <div>No user profile exists</div>;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black p-9 rounded-[20px] w-[893px] h-[635px] border border-[#4d4d4d] relative overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={() => store.setImageDetailModalStatus(false)}
          className="absolute top-10 right-10 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Layout: Left image | Right details */}
        <div className="flex h-full">
          {/* Photo preview */}
          <div className="w-1/2 pr-6 flex items-center justify-center">
            <Image
              src={`/api/image-proxy?cid=${photo.imageUrl.split("/").pop()}`}
              alt={photo.title}
              width={400}
              height={500}
              unoptimized
              className="rounded-lg object-contain max-h-[100%] max-w-[100%]"
            />
          </div>

          {/* Photo details */}
          <div className="w-1/2 flex flex-col justify-between text-white space-y-3">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold">{photo.title}</h2>
              {photo.location && (
                <p className="text-sm text-gray-400 mt-1">{photo.location}</p>
              )}
              <p className="text-sm text-gray-400">
                {new Date(photo.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Camera / Lens info */}
            <div className="space-y-1 text-sm">
              {photo.cameraname && (
                <p>
                  <span className="font-semibold">Camera:</span>{" "}
                  {photo.cameraname}
                </p>
              )}
              {photo.lens && (
                <p>
                  <span className="font-semibold">Lens:</span> {photo.lens}
                </p>
              )}
              {photo.aperture && (
                <p>
                  <span className="font-semibold">Aperture:</span> ƒ/
                  {photo.aperture}
                </p>
              )}
              {photo.shutterspeed && (
                <p>
                  <span className="font-semibold">Shutter Speed:</span>{" "}
                  {photo.shutterspeed}
                </p>
              )}
              {photo.iso && (
                <p>
                  <span className="font-semibold">ISO:</span> {photo.iso}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {photo.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-gray-800 text-xs px-3 py-1 rounded-full border border-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Verified badge (optional logic here) */}
            <div className="mt-2">
              <span className="text-green-400 font-semibold text-sm">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetails;
