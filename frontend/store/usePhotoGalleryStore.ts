import { create } from "zustand";
import { PhotoFromDB } from "@/types/photo";

// Re-export for backward compatibility
export type { PhotoFromDB };

interface PhotoGalleryState {
  photos: PhotoFromDB[];
  setPhotos: (newBatch: PhotoFromDB[]) => void;
  addPhotos: (newPhotos: PhotoFromDB[]) => void;
  resetPhotos: () => void;
}

export const usePhotoGalleryStore = create<PhotoGalleryState>((set) => ({
  photos: [],

  setPhotos: (newBatch) =>
    set(() => ({
      photos: newBatch,
    })),

  addPhotos: (newPhotos) =>
    set((state) => ({
      photos: [...state.photos, ...newPhotos],
    })),

  resetPhotos: () =>
    set(() => ({
      photos: [],
    })),
}));
