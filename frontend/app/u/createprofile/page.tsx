"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import LeftPanel from "@/components/auth/LeftPanel";

import CreatorFeatures from "@/components/auth/RightPanelComponents/page1/CreatorFeatures";
import HeroSection from "@/components/auth/RightPanelComponents/page1/HeroSection";
import ProfileForm from "@/components/auth/RightPanelComponents/page2/ProfileForm";

import { useAuthStore } from "@/store/useAuthStore";

const CreateProfilePage = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { formData, resetFormData, profileFile, checkAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const nextPage = () => setPage((prev) => prev + 1);
  const previousPage = () => setPage((prev) => Math.max(1, prev - 1));

  useEffect(() => {
    // Page initialized
  }, []);

  useEffect(() => {
    const runCheck = async () => {
      const authenticated = await checkAuth();
      if (!authenticated) {
        toast.error("You must be logged in to create a profile.");
        router.push("/u");
      }
    };
    runCheck();
  }, [router, checkAuth]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.bio.trim()) {
      toast.error("Name and bio are required");
      return;
    }

    if (formData.bio.length > 300) {
      toast.error("Bio must be 300 characters or less");
      return;
    }

    if (formData.tags && formData.tags.length > 6) {
      toast.error("You can select up to 6 tags only");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting profile to:", api.defaults.baseURL + "/u/createProfile");
      const submissionData = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Flatten array for backend if needed or send as JSON
          submissionData.append(key, JSON.stringify(value));
        } else {
          submissionData.append(key, value as string);
        }
      });

      // Add profile picture file if exists
      if (profileFile) {
        submissionData.append("profilePic", profileFile);
      }

      const res = await api.post(
        `/u/createProfile`,
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        }
      );

      if (res.data?.slug) {
        toast.success("Profile created successfully!");
        resetFormData();
        router.push(`/u/${res.data.slug}`);
      } else {
        toast.error("Failed to retrieve profile URL.");
      }
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.message || "Profile creation failed";
      toast.error(backendError);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (page === 1) nextPage();
    else handleSubmit();
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-black p-4 sm:p-6 translate-y-[-4%]">
      <style>{`
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
          width: 100vw !important;
          position: fixed !important;
        }
        ::-webkit-scrollbar {
          display: none !important;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="w-full max-w-5xl h-fit min-h-[640px] flex flex-col md:flex-row bg-[#0D0D0D] rounded-[40px] relative border border-white/5 shadow-2xl overflow-hidden">
        {page > 1 && (
          <button
            onClick={previousPage}
            className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-black border border-gray-700 rounded-full hover:bg-white hover:text-black transition-all duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="hidden md:block md:w-5/12">
          <LeftPanel />
        </div>

        <div className="flex-1 relative p-6 sm:p-10 flex flex-col justify-between">
          <div className="flex flex-col gap-6 w-full max-w-md mx-auto md:ml-16 md:mr-auto">
            {page === 1 ? (
              <div className="flex flex-col gap-8">
                <HeroSection />
                <CreatorFeatures />
              </div>
            ) : (
              <div className="flex flex-col gap-5 py-2">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-family-helvetica font-bold tracking-tight">Complete your profile</h2>
                  <p className="text-white/40 text-xs font-family-neue">Tell the world who you are</p>
                </div>
                <ProfileForm />
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end -mr-6 sm:-mr-10 -mb-6 sm:-mb-10">
            <button
              onClick={handleButtonClick}
              disabled={loading}
              className={`h-[60px] w-[220px] flex items-center justify-center rounded-br-[40px] rounded-tl-[20px]
          font-family-neue font-bold text-base border border-gray-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]
          transition-all duration-300 bg-black text-white cursor-pointer hover:bg-white hover:text-black hover:border-white shadow-xl
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
          `}
            >
              {loading ? "Processing..." : page === 1 ? "Get Started" : "Launch Portfolio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfilePage;
