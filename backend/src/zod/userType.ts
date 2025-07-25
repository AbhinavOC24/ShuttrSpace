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
