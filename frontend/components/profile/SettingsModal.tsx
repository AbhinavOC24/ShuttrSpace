import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { useProfileStore } from "@/store/useProfileStore";
import { useErrorStore } from "@/store/useErrorStore";
import Image from "next/image";

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
  const [profileFile, setProfileFile] = useState<File | null>(null);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearGlobalError();
    setLoading(true);

    try {
      const submissionData = new FormData();
      submissionData.append("bio", formData.bio);
      submissionData.append("location", formData.location);
      submissionData.append("birthDate", formData.birthDate);
      submissionData.append("socialLinks", JSON.stringify({
        twitter: formData.twitter,
        instagram: formData.instagram,
        linkedin: formData.linkedin,
        email: formData.email,
      }));

      if (profileFile) {
        submissionData.append("profilePic", profileFile);
      }

      const res = await api.put(
        `/u/auth/updateProfile`,
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        }
      );

      if (res.data?.success) {
        if (store.userProfile) {
          store.setUserProfile({
            ...store.userProfile,
            bio: formData.bio,
            location: formData.location,
            birthDate: formData.birthDate,
            profilePic: res.data.profilePic || previewUrl || store.userProfile.profilePic,
            twitter: formData.twitter,
            instagram: formData.instagram,
            linkedin: formData.linkedin,
            email: formData.email,
          });
        }
        onClose();
      }
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.message || "Update failed";
      setGlobalError(backendError);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6">
      <div className="bg-[#121212] rounded-[30px] w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 className="text-2xl font-family-neue font-bold text-white tracking-tight">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          {globalError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {globalError}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl transition-all duration-500 group-hover:border-white/30">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <img src={store.userProfile?.profilePic || "/placeholder-user.jpg"} alt="Current" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-center sm:text-left">
               <h3 className="text-white font-bold">Profile Picture</h3>
               <p className="text-xs text-white/40 uppercase tracking-widest leading-loose">Square .JPG or .PNG recommended</p>
               <input
                 type="file"
                 id="avatar-upload"
                 accept="image/*"
                 onChange={handleFileChange}
                 className="hidden"
               />
               <label
                 htmlFor="avatar-upload"
                 className="mt-2 inline-block cursor-pointer bg-white/10 hover:bg-white text-white hover:text-black px-6 py-2 rounded-xl text-xs font-bold transition-all border border-white/10"
               >
                 Change Photo
               </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Bio */}
            <div className="flex flex-col gap-3">
              <label className="text-xs uppercase tracking-widest text-white/30 font-bold ml-1">About You</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell the world your story..."
                rows={4}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all font-family-neue leading-relaxed"
              />
            </div>

            {/* Location & BirthDate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase tracking-widest text-white/30 font-bold ml-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Paris, France"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase tracking-widest text-white/30 font-bold ml-1">Birth Date</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white/30 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest text-white/30 font-bold ml-1">Global Connectivity</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { name: "twitter", placeholder: "Twitter / X Profile", icon: (
                     <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                   )},
                   { name: "instagram", placeholder: "Instagram Handle", icon: (
                     <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                   )},
                   { name: "linkedin", placeholder: "LinkedIn Profile", icon: (
                     <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                   )},
                   { name: "email", placeholder: "Public Email", type: "email", icon: (
                     <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                   )}
                 ].map((item) => (
                   <div key={item.name} className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors duration-300">
                       {item.icon}
                     </div>
                     <input
                       type={item.type || "url"}
                       name={item.name}
                       value={(formData as any)[item.name]}
                       onChange={handleChange}
                       placeholder={item.placeholder}
                       className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                     />
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/40 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Syncing..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
