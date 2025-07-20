"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserProfileStore } from "@/store/useProfileStore"; // adjust import path

const CreateProfilePage = () => {
  const { publicKey } = useWallet();
  const router = useRouter();
  const { formData, setFormData, resetFormData } = useUserProfileStore();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      setFormData({ publicKey: publicKey.toBase58() });
    }
  }, [publicKey, setFormData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLocalFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const uploadToImageKit = async (file: File): Promise<string> => {
    try {
      const authResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/imagekit/auth`
      );

      const { signature, expire, token } = authResponse.data;
      const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

      console.log("authresponse", authResponse.data);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", expire.toString());
      formData.append("token", token);

      formData.append("folder", "/profile-pictures");

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
    setError(null);

    if (!formData.name.trim() || !formData.bio.trim() || !localFile) {
      setError("All fields including profile picture are required.");
      return;
    }

    setLoading(true);
    try {
      // Upload image first
      const imageUrl = await uploadToImageKit(localFile);
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
        setError(res.data?.message || "Profile creation failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Profile</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-black shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3"
            placeholder="Your name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-2 w-24 h-24 object-cover rounded-full border"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3"
            rows={4}
            placeholder="Tell us about yourself"
            required
          />
        </div>
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          {loading ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
};

export default CreateProfilePage;
