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

type cameraDetails = {
  cameraname: string;
  lens: string;
  aperture: string;
  iso: string;
  shutterspeed: string;
};
export type PhotosFromUploadQueue = {
  file: File;
  title: string;
  tags: string[];
  location?: string;
  cameraDetails: cameraDetails;
  imageUrl?: string;
  thumbnailUrl?: string;
};

export type PhotoFromDB = {
  id: number;
  title: string;
  tags: string[];
  location?: string;
  cameraname?: string;
  lens?: string;
  aperture?: string;
  iso?: string;
  shutterspeed?: string;
  imageUrl: string;
  thumbnailUrl: string;
  createdAt: string;
};

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
