"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useErrorStore } from "@/store/useErrorStore";
function profilepage() {
  const { slug } = useParams();
  const [canEdit, setCanEdit] = useState(false);
  const [userProfile, setUserProfile] = useState(false);
  const { globalError, setGlobalError, clearGlobalError } = useErrorStore();
  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/getProfile`,
          { slug },
          {
            withCredentials: true,
          }
        );
        const sessionSlug = res.data.slug;
        if (res.data.profile) setUserProfile(res.data.profile);
        if (res.data.authenticated && sessionSlug === slug) {
          setCanEdit(true);
        }
      } catch (err: any) {
        const backendError =
          err.response?.data?.error || err.message || "Upload failed";
        setGlobalError(backendError);
        console.log(err);
      }
    };

    getProfile();
  }, [slug]);
  return (
    <div>
      profilepage
      {userProfile}
    </div>
  );
}

export default profilepage;
