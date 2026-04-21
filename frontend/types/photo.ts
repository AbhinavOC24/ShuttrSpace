// Shared photo-related types used across the application.
// Both the profile store and gallery store import from here.

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
  // Returned by the infinite-scroll feed (joined from users table)
  uploaderName?: string;
  uploaderProfilePic?: string;
  uploaderSlug?: string;
};

export type PhotosFromUploadQueue = {
  file: File;
  title: string;
  tags: string[];
  location?: string;
  cameraDetails: {
    cameraname: string;
    lens: string;
    aperture: string;
    iso: string;
    shutterspeed: string;
  };
  imageUrl?: string;
  thumbnailUrl?: string;
};
