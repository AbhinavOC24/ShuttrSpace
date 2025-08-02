export type UserProfile = {
  name: string;
  bio: string;
  profilePic: string;
  tags: string[];
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
