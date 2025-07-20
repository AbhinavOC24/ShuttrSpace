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
};

function ProfilePage() {
  const { slug } = useParams();
  const [canEdit, setCanEdit] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const setGlobalError = useErrorStore((state) => state.setGlobalError);

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

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <div className="w-24 h-24 mb-4">
          <img
            src={userProfile.profilePic}
            alt={userProfile.name}
            className="w-24 h-24 object-cover rounded-full border-4 border-blue-500"
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">{userProfile.name} </h1>
        <h1 className="text-2xl font-bold mb-2">
          Can Edit:{canEdit ? "Yes" : "No"}{" "}
        </h1>

        <p className="text-gray-300 mb-4">{userProfile.bio}</p>
        {userProfile.tags && userProfile.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {userProfile.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-blue-700 text-white px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="text-xs text-gray-500 break-all">
          <span className="font-semibold">Public Key:</span>{" "}
          {userProfile.publicKey}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
