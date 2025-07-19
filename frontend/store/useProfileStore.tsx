// stores/userProfileStore.ts
import { create } from "zustand";

type FormDataType = {
  publicKey: string;
  name: string;
  bio: string;
  profilePic: string;
};

type UserProfile = {
  formData: FormDataType;
  setFormData: (data: Partial<FormDataType>) => void;
  resetFormData: () => void;
};

export const useUserProfileStore = create<UserProfile>((set) => ({
  formData: {
    publicKey: "",
    name: "",
    bio: "",
    profilePic: "",
  },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetFormData: () =>
    set({
      formData: {
        publicKey: "",
        name: "",
        bio: "",
        profilePic: "",
      },
    }),
}));
