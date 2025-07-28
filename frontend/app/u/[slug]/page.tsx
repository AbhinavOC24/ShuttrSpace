"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useErrorStore } from "@/store/useErrorStore";
import { pinata } from "@/utils/pinataConfig";
import Image from "next/image";
import { generateThumbnail } from "@/utils/generateThumbnails";
import { calculateAge } from "@/utils/dateUtils";

type UserProfile = {
  name: string;
  bio: string;
  profilePic: string;
  tags: string[];
  publicKey: string;
  birthDate: string;
  createdAt: string;
};

type UploadedPhotosMetadata = {
  file: File;
  title: string;
  tags: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
};

type PhotoFromDB = {
  id: number;
  title: string;
  tags: string[];
  photoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
};

function ProfilePage() {
  const { slug } = useParams();
  const setGlobalError = useErrorStore((state) => state.setGlobalError);

  const [canEdit, setCanEdit] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [uploadImageModalStatus, setuploadImageModalStatus] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [gallery, setGallery] = useState<PhotoFromDB[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadedPhotosMetadata[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/getProfile`,
          { slug },
          { withCredentials: true }
        );
        if (
          res.data.authenticated &&
          res.data.sessionSlug === res.data.profile.slug
        ) {
          setCanEdit(true);
        }
        if (res.data.profile) {
          setUserProfile(res.data.profile);
          const photoRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/photo/getPhotos`,
            { withCredentials: true }
          );
          setGallery(photoRes.data.photos);
        }
      } catch (err: any) {
        setGlobalError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch profile"
        );
      }
    };
    getProfile();
  }, [slug, setGlobalError]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const uploadFiles = async () => {
    setUploading(true);
    try {
      const uploadedPhotos = await Promise.all(
        uploadQueue.map(async (photo) => {
          const fullUrlRequest = await fetch("/api/url");
          const fullUrlResponse = await fullUrlRequest.json();
          const fullUpload = await pinata.upload.public
            .file(photo.file)
            .url(fullUrlResponse.url);
          const fileUrl = `https://gateway.pinata.cloud/ipfs/${fullUpload.cid}`;

          const thumbnail = await generateThumbnail(photo.file);
          const thumbUrlRequest = await fetch("/api/url");
          const thumbUrlResponse = await thumbUrlRequest.json();
          const thumbUpload = await pinata.upload.public
            .file(thumbnail)
            .url(thumbUrlResponse.url);
          const thumbnailUrl = `https://gateway.pinata.cloud/ipfs/${thumbUpload.cid}`;

          return { ...photo, imageUrl: fileUrl, thumbnailUrl };
        })
      );
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/photo/uploadPhotos`,
        { uploadedPhotos },
        { withCredentials: true }
      );
      console.log(response.data?.message);
      setGallery((prev) => [...prev, ...response.data.photos]);
    } catch (error) {
      console.error(error);
      alert("Trouble uploading files");
    } finally {
      setuploadImageModalStatus(false);

      setUploading(false);
      setUploadQueue([]);
      setCurrentIndex(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newQueue = selectedFiles.map((file) => ({
      file,
      title: "",
      tags: [],
    }));
    setUploadQueue(newQueue);
    setCurrentIndex(0);
  };

  const nextPhoto = () => {
    if (currentIndex < uploadQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      uploadFiles();
    }
  };

  const prevPhoto = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-[90px] pt-[60px] bg-black text-white">
      <div className="bg-black rounded-lg shadow-lg w-full h-[1000px] flex flex-col gap-[60px]">
        <div className="flex gap-[32px]">
          <div className="relative w-[250px] h-[252px] rounded-[20px] overflow-hidden">
            <img
              src={userProfile.profilePic}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-[2px]">
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col">
                <div className="flex gap-[10px] items-center">
                  <div className="font-family-helvetica text-[32px]">
                    {userProfile.name}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#d9d9d9]" />
                  <div className="text-[28px] font-family-helvetica font-medium">
                    {calculateAge(userProfile.birthDate)}
                  </div>
                </div>
                <div className="font-family-helvetica text-[16px] font-medium -translate-y-1">
                  Uttarakhand,Ind
                </div>
              </div>

              <div className="antialiased text-white w-[571px] h-[107px] font-family-neue font-medium text-[18px] leading-5">
                Emerging concert photographer... {userProfile.bio}
              </div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="text-[16px] font-family-neue font-medium text-[#8A8A8A]">
                Sort By
              </div>
              <div className="flex justify-center items-center gap-[12px]">
                <div
                  key="collections"
                  onClick={() => toggleTag("collections")}
                  className={`${
                    selectedTags.includes("collections")
                      ? "bg-white text-black border-[0.5px] border-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
                      : "border-[#4d4d4d] text-white border-[0.5px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)]"
                  } cursor-pointer gap-[6px] h-[30px] px-[12px] py-[2px] flex items-center rounded-[10px]`}
                >
                  <div
                    className={`w-[5px] h-[5px] rounded-full ${
                      selectedTags.includes("collections")
                        ? "bg-black"
                        : "bg-white"
                    }`}
                  ></div>
                  <span className="font-family-neue font-medium text-[14px]">
                    Collections
                  </span>
                </div>
                <div className="w-px h-[30px] bg-gray-400"></div>
                <div className="flex flex-wrap gap-[4px]">
                  {userProfile.tags.map((tag, idx) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTag(tag)}
                        className={`${
                          isSelected
                            ? "bg-white text-black border-[0.5px] border-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
                            : "border-[#4d4d4d] text-white border-[0.5px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)]"
                        } cursor-pointer gap-[8px] px-[14px] py-[2px] flex items-center rounded-[10px]`}
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
          </div>
        </div>

        <div className="h-full w-full p-[32px] bg-[rgba(255,255,255,0.05)] rounded-[10px] border-[0.5px] border-[#999999]">
          {gallery.map((photo, index) => (
            <Image
              key={index}
              src={photo.thumbnailUrl || ""}
              alt={photo.title || `Uploaded ${index}`}
              width={100}
              height={100}
            />
          ))}
          <button onClick={() => setuploadImageModalStatus(true)}>
            Upload
          </button>
        </div>
      </div>

      {uploadImageModalStatus && (
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
            {uploadQueue[currentIndex] && (
              <div className="flex gap-4">
                <Image
                  src={URL.createObjectURL(uploadQueue[currentIndex].file)}
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
                      value={uploadQueue[currentIndex].title}
                      onChange={(e) => {
                        const updated = [...uploadQueue];
                        updated[currentIndex].title = e.target.value;
                        setUploadQueue(updated);
                      }}
                      className="border border-black"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="tags">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      value={uploadQueue[currentIndex].tags.join(", ")}
                      onChange={(e) => {
                        const updated = [...uploadQueue];
                        updated[currentIndex].tags = e.target.value
                          .split(",")
                          .map((t) => t.trim());
                        setUploadQueue(updated);
                      }}
                      className="border border-black"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setuploadImageModalStatus(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={prevPhoto}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Prev
              </button>
              {currentIndex !== uploadQueue.length - 1 ? (
                <button
                  onClick={nextPhoto}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={uploadFiles}
                  disabled={uploading || uploadQueue.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
