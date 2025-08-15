"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

import { useErrorStore } from "@/store/useErrorStore";
import LeftPanel from "../_components/LoginPage/LeftPanel";

import CreatorFeatures from "./_components/RightPanelComponents/page1/CreatorFeatures";
import HeroSection from "./_components/RightPanelComponents/page1/HeroSection";
import SolanaCredits from "./_components/RightPanelComponents/page1/SolanaCredits";
import ProfileForm from "./_components/RightPanelComponents/page2/ProfileForm";

import { useAuthStore } from "@/store/useAuthStore";

const CreateProfilePage = () => {
  const { publicKey } = useWallet();

  const [page, setPage] = useState(1);
  const router = useRouter();
  const { formData, setFormData, resetFormData, profileFile } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const { globalError, setGlobalError, clearGlobalError } = useErrorStore();

  // Navigation functions
  const nextPage = () => {
    setPage((prev) => prev + 1);
  };

  const previousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  useEffect(() => {
    clearGlobalError();

    if (publicKey) {
      setFormData({ publicKey: publicKey.toBase58() });
    }
  }, [publicKey, setFormData]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get(`/api/u/auth/checkAuthStatus`, {
          withCredentials: true,
        });
        if (!res.data.authenticated) {
          setGlobalError("You must be authenticated to create a profile.");
          router.push("/u");
        }
      } catch (err: any) {
        setGlobalError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to check authentication status"
        );
        router.push("/u");
      }
    };

    checkAuthStatus();
  }, []);

  const uploadToImageKit = async (file: File): Promise<string> => {
    try {
      const authResponse = await axios.get(`/api/api/imagekit/auth`);

      const { signature, expire, token } = authResponse.data;
      const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", expire.toString());
      formData.append("token", token);

      formData.append("folder", "/profile-pictures");

      for (let [key, value] of formData.entries()) {
        if (key === "file") {
          console.log(`${key}: [File object]`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const uploadResponse = await axios.post(
        "https://upload.imagekit.io/api/v1/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      return uploadResponse.data.url;
    } catch (error) {
      console.error("ImageKit upload error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearGlobalError();

    if (!formData.name.trim() || !formData.bio.trim()) {
      setGlobalError("Name and bio are required.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl;
      const localFile = profileFile;
      if (localFile) {
        imageUrl = await uploadToImageKit(localFile);
      }
      setFormData({ profilePic: imageUrl });

      // Now send form data to backend
      const res = await axios.post(
        `/api/u/auth/createProfile`,
        {
          ...formData,
          profilePic: imageUrl,
          socialLinks: {
            twitter: formData.twitter,
            instagram: formData.instagram,
            linkedin: formData.linkedin,
            email: formData.email,
          },
        },
        { withCredentials: true }
      );

      if (res.data?.slug) {
        resetFormData();
        router.push(`/u/${res.data.slug}`);
      } else {
        setGlobalError(res.data?.message || "No Slug found from handle submit");
      }
    } catch (err: any) {
      const backendError =
        err.response?.data?.error || err.message || "Upload failed";
      setGlobalError(backendError);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (page === 1) {
      nextPage();
    } else {
      handleSubmit(new Event("submit") as any);
    }
  };

  return (
    <div className="overflow-hidden flex items-center justify-center h-screen">
      {/* Global Error Display */}
      {globalError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {globalError}
        </div>
      )}
      <div className="w-[974px] h-[610px] flex bg-[#151515] rounded-5xl relative">
        {/* Back Arrow Button - only show if not on page 1 */}
        {page > 1 && (
          <button
            onClick={previousPage}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black border border-[#4d4d4d] rounded-full hover:bg-white hover:text-black transition-all duration-200"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <LeftPanel />

        {page == 1 && (
          <div className="w-[490px] relative rounded-5xl ">
            <div className="relative flex flex-col gap-[20px] w-[389px] h-fit top-[60px] left-[50px] ">
              <HeroSection />

              <CreatorFeatures />
            </div>

            <div className="w-full absolute rounded-5xl h-[50px] bottom-0">
              <SolanaCredits />
              <button
                onClick={handleButtonClick}
                className={`h-[50px] absolute w-[208px] flex items-center justify-center bottom-0 right-0 rounded-br-[40px] rounded-tl-[10px]
          font-family-neue font-medium text-sm border border-[#4d4d4d] shadow-[inset_4px_6px_4px_2px_rgba(255,255,255,0.1)] overflow-hidden
          transition ease-in-out bg-black cursor-pointer hover:bg-white hover:text-black hover:border-white hover:shadow-[inset_2px_2px_4.3px_2px_rgba(0,0,0,0.5)]  
          `}
              >
                {page === 1 ? "Next" : "Sign In"}
              </button>
            </div>
          </div>
        )}

        {page == 2 && (
          <div className="w-[490px] relative rounded-5xl">
            <div className="relative flex flex-col gap-[20px] w-[389px] h-fit top-[60px] left-[50px]">
              <ProfileForm />
            </div>

            <div className="w-full absolute rounded-5xl h-[50px] bottom-0">
              <SolanaCredits />
              <button
                onClick={handleButtonClick}
                disabled={loading}
                className={`h-[50px] absolute w-[208px] flex items-center justify-center bottom-0 right-0 rounded-br-[40px] rounded-tl-[10px]
          font-family-neue font-medium text-sm border border-[#4d4d4d] shadow-[inset_4px_6px_4px_2px_rgba(255,255,255,0.1)] overflow-hidden
          transition ease-in-out bg-black cursor-pointer hover:bg-white hover:text-black hover:border-white hover:shadow-[inset_2px_2px_4.3px_2px_rgba(0,0,0,0.5)]  
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
          `}
              >
                {loading ? "Creating..." : "Sign In"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProfilePage;
