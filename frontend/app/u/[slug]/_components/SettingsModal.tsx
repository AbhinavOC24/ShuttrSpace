import React, { useState, useEffect } from "react";
import axios from "axios";
import { useProfileStore } from "@/store/useProfileStore";
import { useErrorStore } from "@/store/useErrorStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const store = useProfileStore();
  const { globalError, setGlobalError, clearGlobalError } = useErrorStore();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    birthDate: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    email: "",
  });

  // Update form data when modal opens or user profile changes
  useEffect(() => {
    if (isOpen && store.userProfile) {
      setFormData({
        bio: store.userProfile.bio || "",
        location: store.userProfile.location || "",
        birthDate: store.userProfile.birthDate || "",
        twitter: store.userProfile.twitter || "",
        instagram: store.userProfile.instagram || "",
        linkedin: store.userProfile.linkedin || "",
        email: store.userProfile.email || "",
      });
      setPreviewUrl(null);
      setProfileFile(null);
    }
  }, [isOpen, store.userProfile]);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const uploadToImageKit = async (file: File): Promise<string> => {
    try {
      const authResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/imagekit/auth`
      );

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

      const uploadResponse = await axios.post(
        "https://upload.imagekit.io/api/v1/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      return uploadResponse.data.url;
    } catch (error) {
      console.error("ImageKit upload error:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearGlobalError();
    setLoading(true);

    try {
      let imageUrl = store.userProfile?.profilePic;

      if (profileFile) {
        imageUrl = await uploadToImageKit(profileFile);
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/updateProfile`,
        {
          bio: formData.bio,
          location: formData.location,
          birthDate: formData.birthDate,
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

      if (res.data?.success) {
        // Update the store with new data
        if (store.userProfile) {
          store.setUserProfile({
            ...store.userProfile,
            bio: formData.bio,
            location: formData.location,
            birthDate: formData.birthDate,
            profilePic: imageUrl || store.userProfile.profilePic,
            twitter: formData.twitter,
            instagram: formData.instagram,
            linkedin: formData.linkedin,
            email: formData.email,
          });
        }
        onClose();
      }
    } catch (err: any) {
      const backendError =
        err.response?.data?.error || err.message || "Update failed";
      setGlobalError(backendError);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#151515] p-8 rounded-[20px] w-[600px] max-h-[90vh] overflow-y-auto border border-[#4d4d4d]">
        {/* Global Error Display */}
        {globalError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {globalError}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-2">
            <label className="text-white text-sm text-[14px]">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 font-family-neue rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : store.userProfile?.profilePic ? (
                  <img
                    src={store.userProfile.profilePic}
                    alt="Current profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="text-[14px] flex flex-col gap-[12px]">
            <label className="text-[#9c9c9c] text-sm text-[14px]">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 text-[14px] border-[0.5px] border-[#4d4d4d] rounded-[10px] text-white placeholder-gray-400 focus:outline-none transition-colors bg-transparent"
            />
          </div>

          {/* Location */}
          <div className="text-[14px] flex flex-col gap-[12px]">
            <label className="text-[#9c9c9c] text-sm text-[14px]">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              className="w-full px-4 py-3 text-[14px] h-[38px] border-[0.5px] border-[#4d4d4d] rounded-[10px] text-white placeholder-gray-400 focus:outline-none transition-colors bg-transparent"
            />
          </div>

          {/* Birth Date */}
          <div className="text-[14px] flex flex-col gap-[12px]">
            <label className="text-[#9c9c9c] text-sm text-[14px]">
              Birth Date
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full px-4 py-3 text-[14px] h-[38px] border-[0.5px] border-[#4d4d4d] rounded-[10px] text-white focus:outline-none transition-colors bg-transparent"
            />
          </div>

          {/* Social Links */}
          <div className="text-[14px] gap-[12px] flex flex-col">
            <label className="text-[#9c9c9c] text-sm text-[14px]">
              Social Links (Optional)
            </label>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="Twitter URL"
                  className="flex-1 px-4 py-3 border-[0.5px] h-[38px] border-[#4d4d4d] rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors bg-transparent"
                />
              </div>

              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-pink-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                </svg>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="Instagram URL"
                  className="flex-1 px-4 py-3 border-[0.5px] border-[#4d4d4d] h-[38px] rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors bg-transparent"
                />
              </div>

              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn URL"
                  className="flex-1 px-4 py-3 border-[0.5px] border-[#4d4d4d] h-[38px] rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors bg-transparent"
                />
              </div>

              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819v9.273L12 7.27l6.545 4.91V3.82h3.819A1.636 1.636 0 0 1 24 5.457z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="flex-1 px-4 py-3 border-[0.5px] border-[#4d4d4d] h-[38px] rounded-lg text-white focus:outline-none transition-colors bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-[10px] hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white text-black rounded-[10px] hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
