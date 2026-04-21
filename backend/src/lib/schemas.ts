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

const cameraDetailsSchema = z.object({
  cameraname: z.string().max(100, "Camera name too long").optional(),
  lens: z.string().max(150, "Lens description too long").optional(),
  aperture: z.string().regex(/^f\/\d+(\.\d+)?$/, "Aperture must be in format 'f/X.X'").or(z.literal("")).optional(),
  iso: z.string().regex(/^\d+$/, "ISO must be a number").or(z.literal("")).optional(),
  shutterspeed: z.string().regex(/^(\d+\/\d+|\d+(\.\d+)?s)$/, "Shutterspeed must be '1/X' or 'Xs'").or(z.literal("")).optional(),
});

export const createPhotoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long").or(z.literal("")).optional().default("Untitled"),
  tags: z.array(z.string().max(30)).max(10, "Too many tags").optional().default([]),
  location: z.string().max(100, "Location too long").optional(),
  cameraDetails: cameraDetailsSchema.optional(),
  imageUrl: z.string().url("Invalid image URL"),
});

export const photoMetadataArraySchema = z.array(createPhotoSchema);
