import * as z from "zod";

export const signupSchema = z.object({
  name: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createUserProfileSchema = z.object({
  tags: z.string().array().max(6).optional(),
  birthDate: z.string().optional(),
  bio: z.string().max(300).optional(),
  location: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  profilePic: z.string().optional(),
});

const cameraDetails = z.object({
  cameraname: z.string().optional(),
  lens: z.string().optional(),
  aperture: z.string().optional(),
  iso: z.string().optional(),
  shutterspeed: z.string().optional(),
});

export const createPhotoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tags: z.array(z.string()).optional().default([]),
  location: z.string().optional(),
  cameraDetails: cameraDetails.optional(),
});

export const createPhotosArraySchema = z.object({
  items: z.array(createPhotoSchema).min(1, "No photos provided"),
});
