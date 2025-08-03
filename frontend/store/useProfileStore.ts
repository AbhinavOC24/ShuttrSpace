import { create } from "zustand";
export type UserProfile = {
  name: string;
  bio: string;
  profilePic: string;
  tags: string[];
  location: string;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  email: string | null;
  publicKey: string;
  birthDate: string;
  createdAt: string;
};

export type PhotosFromUploadQueue = {
  file: File;
  title: string;
  tags: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
};

export type PhotoFromDB = {
  id: number;
  title: string;
  tags: string[];
  photoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
};
interface ProfileState {
  userProfile: UserProfile | null;
  canEdit: boolean;
  selectedTags: string[];
  uploadImageModalStatus: boolean;
  uploading: boolean;
  gallery: PhotoFromDB[];
  uploadQueue: PhotosFromUploadQueue[];
  currentIndex: number;

  setUserProfile: (profile: UserProfile | null) => void;
  setCanEdit: (canEdit: boolean) => void;

  setuploadImageModalStatus: (state: boolean) => void;
  setUploading: (state: boolean) => void;

  setGallery: (photos: PhotoFromDB[]) => void;
  addToGallery: (photos: PhotoFromDB[]) => void; // Add photos to existing gallery
  resetUploadQueue: () => void;
  setUploadQueue: (photos: PhotosFromUploadQueue[]) => void;
  setCurrentIndex: (index: number) => void;
  toggleTag: (tag: string) => void;
  notFound: boolean;
  setNotFound: (notFound: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  userProfile: null,
  canEdit: false,
  notFound: false,
  setNotFound: (notFound) => set({ notFound }),
  selectedTags: [],

  uploadImageModalStatus: false,
  uploading: false,
  gallery: [],
  uploadQueue: [],
  currentIndex: 0,

  setUserProfile: (profile) => set({ userProfile: profile }),
  setCanEdit: (canEdit) => set({ canEdit }),

  setuploadImageModalStatus: (state) => set({ uploadImageModalStatus: state }),
  setUploading: (state) => set({ uploading: state }),
  setGallery: (photos) => set({ gallery: photos }),
  addToGallery: (photos) =>
    set((state) => ({
      gallery: [...state.gallery, ...photos],
    })),
  resetUploadQueue: () => set({ uploadQueue: [] }),

  setUploadQueue: (photos) => set({ uploadQueue: photos }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  toggleTag: (tag) => {
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    }));
  },
}));
