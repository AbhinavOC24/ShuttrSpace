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

function ProfilePage() {
  const { slug } = useParams();

  const [canEdit, setCanEdit] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const setGlobalError = useErrorStore((state) => state.setGlobalError);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [uploadImageModalStatus, setuploadImageModalStatus] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

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

        if (res.data.profile) setUserProfile(res.data.profile);
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

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0] || null;
  //   setLocalFile(file);
  //   setPreviewUrl(file ? URL.createObjectURL(file) : null);
  // };

  // const uploadToImageKit = async (file: File): Promise<string> => {
  //   const authResponse = await axios.get(
  //     `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/imagekit/auth`
  //   );
  //   const { signature, expire, token } = authResponse.data;
  //   const publicKey = process.env.IMAGEKIT_PUBLIC_KEY!;
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("fileName", file.name);
  //   formData.append("publicKey", publicKey);
  //   formData.append("signature", signature);
  //   formData.append("expire", expire.toString());
  //   formData.append("token", token);
  //   formData.append("folder", "/profile-pictures");

  //   const uploadResponse = await axios.post(
  //     "https://upload.imagekit.io/api/v1/files/upload",
  //     formData,
  //     { headers: { "Content-Type": "multipart/form-data" } }
  //   );

  //   return uploadResponse.data.url;
  // };

  // const handleImageUpload = async () => {
  //   if (!localFile) return;
  //   try {
  //     const imageUrl = await uploadToImageKit(localFile);
  //     await axios.post(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/updateProfilePic`,
  //       { imageUrl },
  //       { withCredentials: true }
  //     );
  //     setUserProfile((prev) =>
  //       prev ? { ...prev, profilePic: imageUrl } : prev
  //     );
  //     setLocalFile(null);
  //     setPreviewUrl(null);
  //   } catch (error) {
  //     setGlobalError("Image upload failed");
  //   }
  // };

  const uploadFiles = async () => {
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fullUrlRequest = await fetch("/api/url");
        const fullUrlResponse = await fullUrlRequest.json();
        const fullUpload = await pinata.upload.public
          .file(file)
          .url(fullUrlResponse.url);
        const fileUrl = `https://gateway.pinata.cloud/ipfs/${fullUpload.cid}`;

        const thumbnail = await generateThumbnail(file);
        const thumbUrlRequest = await fetch("/api/url");
        const thumbUrlResponse = await thumbUrlRequest.json();
        const thumbUpload = await pinata.upload.public
          .file(thumbnail)
          .url(thumbUrlResponse.url);
        const thumbnailUrl = `https://gateway.pinata.cloud/ipfs/${thumbUpload.cid}`;

        uploadedUrls.push(thumbnailUrl);
      }

      setUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error(error);
      alert("Trouble uploading files");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
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
      <div className="bg-black rounded-lg shadow-lg w-full h-[1000px] flex flex-col   gap-[60px]">
        <div className="flex gap-[32px] ">
          {/* Profile Pic (with hover change) */}
          <div
            className="relative  w-[250px] h-[252px] rounded-[20px] overflow-hidden"
            // onMouseEnter={() => setHovering(true)}
            // onMouseLeave={() => setHovering(false)}
          >
            <img
              src={userProfile.profilePic}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />

            {/* {canEdit && hovering && (
              <div className="absolute inset-0 bg-black bg-opacity-100 flex flex-col items-center justify-center gap-2">
                <label className="cursor-pointer px-3 py-1 bg-white text-black rounded text-xs">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )} */}
            {/*
            {localFile && (
              <button
                onClick={handleImageUpload}
                className="absolute bottom-2 left-2 px-3 py-1 bg-blue-600 text-white rounded text-xs"
              >
                Save
              </button>
            )} */}
          </div>
          {/* details */}
          <div className=" flex flex-col gap-[2px]">
            {/* Name,lcoation and bio */}
            <div className="flex flex-col gap-[10px]">
              {/* Name section */}
              <div className="flex flex-col ">
                <div className="flex gap-[10px] p-0 m-0 items-center">
                  <div className="font-family-helvetica  text-[32px] antialiased leading-[0]">
                    {userProfile.name}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#d9d9d9]"></div>
                  <div className="text-[28px] font-family-helvetica antialiased font-medium text-center">
                    {calculateAge(userProfile.birthDate)}
                  </div>
                </div>
                {/* location */}
                <div className="font-family-helvetica text-[16px] antialiased -translate-y-1 font-medium">
                  Uttarakhand,Ind
                </div>
              </div>

              {/* Bio section */}
              <div className="antialiased text-white w-[571px] h-[107px] font-family-neue font-medium text-[18px] leading-5">
                Emerging concert photographer with a growing love for capturing
                live music moments—sweat, light, sound, and everything in
                between. Currently exploring local gigs, learning fast, and
                chasing that perfect shot in the chaos of the crowd. 300chars
                {userProfile.bio}
              </div>
            </div>

            {/* Sort By section */}
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
                  } cursor-pointer transition-colors gap-[6px] h-[30px] px-[12px] py-[2px] flex items-center rounded-[10px]`}
                >
                  <div
                    className={`w-[5px] h-[5px] rounded-full ${
                      selectedTags.includes("collections")
                        ? "bg-black"
                        : "bg-white"
                    }`}
                  ></div>
                  <span className="font-family-neue font-medium text-[14px] whitespace-nowrap">
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
                        } cursor-pointer transition-colors h-[30px] gap-[8px] px-[14px] py-[2px] flex items-center rounded-[10px]`}
                      >
                        <div
                          className={`w-[5px] h-[5px] rounded-full ${
                            isSelected ? "bg-black" : "bg-white"
                          }`}
                        ></div>
                        <span className="font-family-neue font-medium text-[14px] whitespace-nowrap">
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

        {/* showcase */}
        <div className="h-full w-full  p-[32px] bg-[rgba(255,255,255,0.05)] rounded-[10px] border-[0.5px] border-[#999999]">
          {urls.map((url, index) => (
            <Image
              key={index}
              src={url}
              alt={`Uploaded ${index}`}
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
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-black">Upload Image</h2>
            <input
              type="file"
              onChange={handleChange}
              multiple
              accept="image/*"
              className="mb-4 w-full text-black"
            />
            {previews.map((url, index) => (
              <Image
                key={index}
                src={url}
                alt={`Preview ${index}`}
                width={64}
                height={64}
                className="border rounded"
              />
            ))}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setuploadImageModalStatus(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await uploadFiles();
                  setuploadImageModalStatus(false);
                }}
                disabled={uploading || files.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
