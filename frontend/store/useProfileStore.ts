// stores/userProfileStore.ts
import { create } from "zustand";

type FormDataType = {
  publicKey: string;
  name: string;
  bio: string;
  profilePic: string;
  tags: string[];
  birthDate: string;
};

type UserProfile = {
  formData: FormDataType;
  setFormData: (data: Partial<FormDataType>) => void;
  toggleTag: (tag: string) => void;
  resetFormData: () => void;
};

export const useUserProfileStore = create<UserProfile>((set) => ({
  formData: {
    publicKey: "",
    name: "",
    bio: "",
    profilePic: "",
    tags: [] as string[],
    birthDate: "",
  },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  toggleTag: (tag: string) =>
    set((state) => ({
      formData: {
        ...state.formData,
        tags: state.formData.tags.includes(tag)
          ? state.formData.tags.filter((t) => t !== tag)
          : [...state.formData.tags, tag],
      },
    })),
  resetFormData: () =>
    set({
      formData: {
        publicKey: "",
        name: "",
        bio: "",
        profilePic: "",
        birthDate: "",
        tags: [] as string[],
      },
    }),
}));
