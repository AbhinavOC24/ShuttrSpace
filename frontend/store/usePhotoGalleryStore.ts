import { create } from "zustand";
import axios from "axios";

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

interface PhotoGalleryState {
  photos: PhotoFromDB[];
  setPhotos: (newBatch: PhotoFromDB[]) => void;
  resetPhotos: () => void;
}

export const usePhotoGalleryStore = create<PhotoGalleryState>((set) => ({
  photos: [],

  setPhotos: (newBatch) =>
    set(() => ({
      photos: newBatch,
    })),

  resetPhotos: () =>
    set(() => ({
      photos: [],
    })),
}));
