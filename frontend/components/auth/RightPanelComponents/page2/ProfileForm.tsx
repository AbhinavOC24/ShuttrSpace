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
    <div className="flex flex-col gap-6 w-full">
      {/* Name & Location Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold font-family-neue">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full px-4 py-3 text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-white/30 transition-all outline-none font-family-neue"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold font-family-neue">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            placeholder="e.g. Tokyo, Japan"
            className="w-full px-4 py-3 text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-white/30 transition-all outline-none font-family-neue"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold font-family-neue">Bio</label>
        <textarea
          name="bio"
          value={formData.bio || ""}
          onChange={handleChange}
          placeholder="What's your story?"
          rows={2}
          className="w-full px-4 py-3 text-sm bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-white/30 transition-all outline-none resize-none font-family-neue"
        />
      </div>

      {/* Profile Picture & Socials Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-3">
          <label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold font-family-neue">Profile Photo</label>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="text-white/10 group-hover:text-white/20 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="cursor-pointer px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-white/90 transition-all active:scale-95">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-[9px] text-white/20 font-family-neue uppercase tracking-wider">Max 5MB</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold font-family-neue">Social Links</label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 focus-within:border-white/30 transition-all">
              <svg className="w-3.5 h-3.5 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <input
                type="url"
                name="twitter"
                value={formData.twitter || ""}
                onChange={handleChange}
                placeholder="X handle"
                className="bg-transparent border-none outline-none text-[11px] text-white w-full"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 focus-within:border-white/30 transition-all">
              <svg className="w-3.5 h-3.5 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
              <input
                type="url"
                name="instagram"
                value={formData.instagram || ""}
                onChange={handleChange}
                placeholder="Instagram handle"
                className="bg-transparent border-none outline-none text-[11px] text-white w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-4 pt-2">
        <label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold font-family-neue">Select your specialties (Max 6)</label>
        <div className="flex flex-wrap gap-2.5">
          {SUGGESTED_TAGS.map((tag) => {
            const isSelected = formData.tags?.includes(tag) || false;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all duration-300 font-family-neue border ${isSelected
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105"
                    : "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
