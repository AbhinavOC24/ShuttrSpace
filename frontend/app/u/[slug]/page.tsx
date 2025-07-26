"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useErrorStore } from "@/store/useErrorStore";

type UserProfile = {
  name: string;
  bio: string;
  profilePic: string;
  tags: string[];
  publicKey: string;
  birthDate: string;
  createdAt: string;
};

function calculateAge(dateString: string) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function ProfilePage() {
  const { slug } = useParams();
  const [canEdit, setCanEdit] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const setGlobalError = useErrorStore((state) => state.setGlobalError);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-[90px] pt-[60px] bg-black text-white ">
      <div className="bg-black rounded-lg shadow-lg w-full h-[1000px]  items-center border">
        <div className="flex gap-[32px] border ">
          {/* Profile Pic */}
          <div className="w-[250px] h-[250px]  ">
            {userProfile.profilePic == "no image" ? (
              <img
                src={userProfile.profilePic}
                alt={userProfile.name}
                className="w-[250px] h-[250px] object-cover rounded-full border-4 border-blue-500"
              />
            ) : (
              <div className="border-red-400 w-[250px] h-[250px]">
                Upload A Pic
              </div>
            )}
          </div>
          <div className="">
            <div className=" flex flex-col gap-[20px]">
              {/* Name section */}
              <div className="flex  flex-col ">
                <div className="flex  gap-[10px] items-center">
                  {/* Profile Name */}
                  <div className=" font-family-helvetica font-medium text-[32px] leading-[0]">
                    {userProfile.name}
                  </div>
                  {/* dot */}
                  <div className="w-2 h-2  rounded-full bg-[#d9d9d9]"></div>
                  {/* birthdate */}
                  <div className="text-[28px] text-white  font-family-helvetica font-medium text-center ">
                    {calculateAge(userProfile.birthDate)}
                  </div>
                </div>
                <div className="font-family-helvetica text-[16px] font-medium">
                  Uttarakhand,Ind
                </div>
              </div>

              {/* Bio section */}
              <div className="text-white w-[571px] h-[107px]  font-family-neue font-medium text-[18px] leading-5.5">
                {userProfile.bio}
              </div>
            </div>
            {/* Sort By section */}

            <div className="flex flex-col gap-[6px] ">
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

                <div className="flex flex-wrap gap-[4px] ">
                  {userProfile.tags.map((tag, idx) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTag(tag)}
                        className={`${
                          isSelected
                            ? "bg-white text-black border-[0.5px] border-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
                            : " border-[#4d4d4d] text-white border-[0.5px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)]"
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
        {/* <h1 className="text-2xl font-bold mb-2">
          Can Edit:{canEdit ? "Yes" : "No"}{" "}
        </h1> */}
      </div>
    </div>
  );
}

export default ProfilePage;
