import { create } from "zustand";
import { UserProfile } from "@/types/user";
import { PhotoFromDB, PhotosFromUploadQueue } from "@/types/photo";

// Re-export for any modules relying on these definitions being here (temporary backward compatibility)
export type { UserProfile, PhotosFromUploadQueue, PhotoFromDB };


interface ProfileState {
  userProfile: UserProfile | null;
  canEdit: boolean;
  selectedTags: string[];
  uploadImageModalStatus: boolean;
  imageDetailModalStatus: boolean;
  uploading: boolean;
  gallery: PhotoFromDB[];
  uploadQueue: PhotosFromUploadQueue[];
  currentIndex: number;
  filteredGallery: () => PhotoFromDB[];
  setUserProfile: (profile: UserProfile | null) => void;
  setCanEdit: (canEdit: boolean) => void;
  selectedImage: PhotoFromDB | null;
  setuploadImageModalStatus: (state: boolean) => void;
  setImageDetailModalStatus: (state: boolean) => void;

  setUploading: (state: boolean) => void;

  setGallery: (photos: PhotoFromDB[]) => void;
  addToGallery: (photos: PhotoFromDB[]) => void;
  resetUploadQueue: () => void;
  setUploadQueue: (photos: PhotosFromUploadQueue[]) => void;
  setCurrentIndex: (index: number) => void;
  toggleTag: (tag: string) => void;
  notFound: boolean;
  setSelectedImage: (image: PhotoFromDB) => void;
  setNotFound: (notFound: boolean) => void;
  uploaderPubkey: string | null;
  setUploaderPubkey: (key: string) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  userProfile: null,
  canEdit: false,
  notFound: false,
  setNotFound: (notFound) => set({ notFound }),
  setUploaderPubkey: (key) => set({ uploaderPubkey: key }),
  selectedTags: [],
  imageDetailModalStatus: false,
  selectedImage: null,
  uploaderPubkey: null,
  uploadImageModalStatus: false,
  uploading: false,
  gallery: [],
  uploadQueue: [],
  currentIndex: 0,
  setSelectedImage: (image) => set({ selectedImage: image }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setCanEdit: (canEdit) => set({ canEdit }),
  setImageDetailModalStatus: (state) => set({ imageDetailModalStatus: state }),

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

  filteredGallery: () => {
    const { gallery, selectedTags } = get();

    if (selectedTags.length === 0) return gallery;

    return gallery.filter((photo) => {
      if (!photo.tags || photo.tags.length === 0) return false;

      return photo.tags.some((tag) => selectedTags.includes(tag));
    });
  },
  toggleTag: (tag) => {
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    }));
  },
}));
