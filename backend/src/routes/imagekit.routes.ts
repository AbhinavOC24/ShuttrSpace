import express from "express";
const router = express.Router();
import ImageKit from "imagekit";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

if (
  !process.env.IMAGEKIT_PUBLICKEY ||
  !process.env.IMAGEKIT_PRIVATEKEY ||
  !process.env.IMAGEKIT_URLENDPOINT
) {
  throw new Error("Missing ImageKit environment variables");
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLICKEY,
  privateKey: process.env.IMAGEKIT_PRIVATEKEY,
  urlEndpoint: process.env.IMAGEKIT_URLENDPOINT,
});

router.get("/auth", (req: Request, res: Response) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    console.log("Auth parameters generated:", result);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    res.json(result);
  } catch (error) {
    console.error("Error generating auth parameters:", error);
    res.status(500).json({ error: "Failed to generate auth parameters" });
  }
});

export default router;
