"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserProfileStore } from "@/store/useProfileStore"; // adjust import path
import { useErrorStore } from "@/store/useErrorStore";
import LeftPanel from "../_components/LoginPage/LeftPanel";
import Image from "next/image";
import CreatorFeatures from "./_components/RightPanelComponents/CreatorFeatures";
import HeroSection from "./_components/RightPanelComponents/HeroSection";
import SolanaCredits from "./_components/RightPanelComponents/SolanaCredits";
import back_tats from "@public/back_tats.png";

const CreateProfilePage = () => {
  const { publicKey } = useWallet();
  const router = useRouter();
  const { formData, setFormData, resetFormData } = useUserProfileStore();

  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { globalError, setGlobalError, clearGlobalError } = useErrorStore();
  useEffect(() => {
    clearGlobalError();

    if (publicKey) {
      setFormData({ publicKey: publicKey.toBase58() });
    }
  }, [publicKey, setFormData]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/checkAuthStatus`,
          { withCredentials: true }
        );
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

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0] || null;
  //   setLocalFile(file);
  //   setPreviewUrl(file ? URL.createObjectURL(file) : null);
  // };

  // const uploadToImageKit = async (file: File): Promise<string> => {
  //   try {
  //     const authResponse = await axios.get(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/imagekit/auth`
  //     );

  //     const { signature, expire, token } = authResponse.data;
  //     const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

  //     console.log("authresponse", authResponse.data);
  //     const formData = new FormData();
  //     formData.append("file", file);
  //     formData.append("fileName", file.name);
  //     formData.append("publicKey", publicKey);
  //     formData.append("signature", signature);
  //     formData.append("expire", expire.toString());
  //     formData.append("token", token);

  //     formData.append("folder", "/profile-pictures");

  //     const uploadResponse = await axios.post(
  //       "https://upload.imagekit.io/api/v1/files/upload",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //         timeout: 30000, // 30 second timeout
  //       }
  //     );

  //     return uploadResponse.data.url;
  //   } catch (error) {
  //     console.error("ImageKit upload error:", error);
  //     if (axios.isAxiosError(error)) {
  //       console.error("Response data:", error.response?.data);
  //       console.error("Response status:", error.response?.status);
  //     }
  //     throw new Error("Failed to upload image");
  //   }
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearGlobalError();

    if (!formData.name.trim() || !formData.bio.trim()) {
      setGlobalError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      // Upload image first
      // const imageUrl = await uploadToImageKit(localFile);
      const imageUrl = "No image";
      setFormData({ profilePic: imageUrl });

      // Now send form data to backend
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/createProfile`,
        { ...formData, profilePic: imageUrl },
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

  return (
    // <div className="min-h-screen flex flex-col items-center justify-center p-4">
    //   <h1 className="text-2xl font-bold mb-4">Create Your Profile</h1>
    //   <form
    //     onSubmit={handleSubmit}
    //     className="bg-black shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
    //   >
    //     <div className="mb-4">
    //       <label className="block text-gray-700 text-sm font-bold mb-2">
    //         Name
    //       </label>
    //       <input
    //         type="text"
    //         name="name"
    //         value={formData.name}
    //         onChange={handleChange}
    //         className="shadow border rounded w-full py-2 px-3"
    //         placeholder="Your name"
    //         required
    //       />
    //     </div>
    //     <div className="mb-4">
    //       <label className="block text-gray-700 text-sm font-bold mb-2">
    //         Profile Picture
    //       </label>
    //       <input
    //         type="file"
    //         accept="image/*"
    //         onChange={handleFileChange}
    //         className="block w-full text-sm file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    //         required
    //       />
    //       {previewUrl && (
    //         <img
    //           src={previewUrl}
    //           alt="Preview"
    //           className="mt-2 w-24 h-24 object-cover rounded-full border"
    //         />
    //       )}
    //     </div>
    //     <div className="mb-4">
    //       <label className="block text-gray-700 text-sm font-bold mb-2">
    //         Bio
    //       </label>
    //       <textarea
    //         name="bio"
    //         value={formData.bio}
    //         onChange={handleChange}
    //         className="shadow border rounded w-full py-2 px-3"
    //         rows={4}
    //         placeholder="Tell us about yourself"
    //         required
    //       />
    //     </div>
    //     {globalError && (
    //       <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
    //         {globalError}
    //       </div>
    //     )}
    //     <button
    //       type="submit"
    //       disabled={loading}
    //       className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
    //     >
    //       {loading ? "Creating..." : "Create Profile"}
    //     </button>
    //   </form>
    // </div>
    <div className="overflow-hidden flex items-center justify-center h-screen">
      {/* Global Error Display */}
      {globalError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {globalError}
        </div>
      )}
      <div className="w-[974px] h-[610px] flex bg-[#151515] rounded-5xl">
        <LeftPanel />

        <div className="w-[490px] relative rounded-5xl ">
          <div className="relative flex flex-col gap-[20px] w-[389px] h-fit top-[60px] left-[50px] ">
            <HeroSection />

            <CreatorFeatures />
          </div>

          <div className="w-full absolute rounded-5xl h-[50px] bottom-0">
            <SolanaCredits />
            <button
              onClick={handleSubmit}
              className={`h-[50px] absolute w-[208px] flex items-center justify-center bottom-0 right-0 rounded-br-[40px] rounded-tl-[10px]
          font-family-neue font-medium text-sm border border-[#4d4d4d] shadow-[inset_4px_6px_4px_2px_rgba(255,255,255,0.1)] overflow-hidden
          transition ease-in-out bg-black cursor-pointer hover:bg-white hover:text-black hover:border-white hover:shadow-[inset_2px_2px_4.3px_2px_rgba(0,0,0,0.5)]  
          `}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfilePage;
