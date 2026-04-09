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
      console.log("Submitting profile to:", api.defaults.baseURL + "/u/auth/createProfile");
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
        `/u/auth/createProfile`,
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
    <div className="overflow-hidden flex items-center justify-center min-h-screen bg-black p-4 sm:p-6">
      <div className="w-full max-w-5xl h-fit min-h-[610px] flex flex-col md:flex-row bg-[#151515] rounded-[40px] relative border border-gray-800 shadow-2xl overflow-hidden">
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

        <div className="flex-1 relative p-6 sm:p-12 flex flex-col justify-between">
          <div className="flex flex-col gap-8 w-full max-w-md mx-auto">
            {page === 1 ? (
              <>
                <HeroSection />
                <CreatorFeatures />
              </>
            ) : (
              <ProfileForm />
            )}
          </div>

          <div className="mt-12 flex justify-end -mr-6 sm:-mr-12 -mb-6 sm:-mb-12">
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
