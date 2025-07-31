import * as z from "zod";
import { PublicKey } from "@solana/web3.js";

export const publicKeySchema = z.string().refine(
  (val) => {
    try {
      new PublicKey(val);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: "Invalid Solana public key",
  }
);
export const createUserSchema = z.object({
  name: z.string().min(3).max(20),
  tags: z.string().array().max(6).optional(),
  birthDate: z.string(),
  bio: z.string().max(50),
  profilePic: z.string(),
  publicKey: publicKeySchema,
});

export const createPhotoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tags: z.array(z.string()).optional().default([]),
  imageUrl: z.string().url("Valid image URL required"),
  thumbnailUrl: z.string().url("Valid thumbnail URL required"),
});
export const createPhotosArraySchema = z.object({
  metadataCid: z.string(),
  signature: z.string(),
  items: z.array(createPhotoSchema).min(1, "No photos provided"),
});
