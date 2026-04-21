import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const ProfileForm = () => {
  const { formData, setFormData, setProfileFile, toggleTag } = useAuthStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const SUGGESTED_TAGS = ["Street", "Nature", "Portrait", "Architecture", "Fine Art", "Travel"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-[#9c9c9c] text-sm font-family-neue">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="Your professional name"
          className="w-full px-4 py-3 text-[14px] h-[44px] border border-[#333] bg-black/20 rounded-[12px] text-white focus:border-white/20 transition-all outline-none font-family-neue"
        />
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2">
        <label className="text-[#9c9c9c] text-sm font-family-neue">Bio</label>
        <textarea
          name="bio"
          value={formData.bio || ""}
          onChange={handleChange}
          placeholder="Briefly describe your vision..."
          rows={3}
          className="w-full px-4 py-3 text-[14px] border border-[#333] bg-black/20 rounded-[12px] text-white focus:border-white/20 transition-all outline-none resize-none font-family-neue"
        />
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col gap-3">
        <label className="text-[#9c9c9c] text-sm font-family-neue">Profile Photo</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#333] flex items-center justify-center overflow-hidden shrink-0">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-xs text-white/30 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 font-family-neue"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-3">
        <label className="text-[#9c9c9c] text-sm font-family-neue">Categories (Max 6)</label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => {
            const isSelected = formData.tags?.includes(tag) || false;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all font-family-neue ${
                  isSelected ? "bg-white text-black border-white" : "border-[#333] text-white/40 hover:border-white/20"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        <label className="text-[#9c9c9c] text-sm font-family-neue">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location || ""}
          onChange={handleChange}
          placeholder="City, Country"
          className="w-full px-4 py-3 text-[14px] h-[44px] border border-[#333] bg-black/20 rounded-[12px] text-white focus:border-white/20 transition-all outline-none font-family-neue"
        />
      </div>

      {/* Social Links */}
      <div className="flex flex-col gap-4 py-2 border-t border-[#333]/50">
        <label className="text-[#9c9c9c] text-sm font-bold uppercase tracking-widest text-[10px] font-family-neue">Social Presence</label>
        <div className="grid grid-cols-1 gap-3">
          <input
            type="url"
            name="twitter"
            value={formData.twitter || ""}
            onChange={handleChange}
            placeholder="Twitter/X URL"
            className="w-full px-4 py-2 text-[13px] bg-black/20 border border-[#333] rounded-lg text-white font-family-neue"
          />
          <input
            type="url"
            name="instagram"
            value={formData.instagram || ""}
            onChange={handleChange}
            placeholder="Instagram URL"
            className="w-full px-4 py-2 text-[13px] bg-black/20 border border-[#333] rounded-lg text-white font-family-neue"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
