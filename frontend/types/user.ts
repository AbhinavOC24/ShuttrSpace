// Shared user-related types used across the application.

export type UserProfile = {
  name: string;
  bio: string;
  profilePic: string;
  tags: string[];
  location: string;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  email?: string | null;
  publicKey?: string;
  birthDate?: string;
  createdAt?: string;
  slug?: string;
};
