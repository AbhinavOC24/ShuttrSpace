import { Request, Response } from "express";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { createUserSchema } from "../zod/userType";
import prismaClient from "../lib/prisma";
import { PublicKey } from "@solana/web3.js";

export const getNonce = (req: Request, res: Response) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey)
      return res.status(400).json({ error: "Missing public Key" });

    let base58PublicKey: string;
    try {
      base58PublicKey = new PublicKey(publicKey).toBase58();
    } catch (e) {
      return res.status(400).json({ error: "Invalid public Key format" });
    }

    const nonce = `Sign this message to login: ${Math.floor(
      Math.random() * 1000000
    )}`;

    req.session.nonce = nonce;
    req.session.publicKey = base58PublicKey;
    req.session.authenticated = false;
    req.session.hasProfile = false;

    console.log("Stored nonce:", req.session.nonce);
    console.log("Stored publicKey:", req.session.publicKey);

    res.json({ nonce });
  } catch (e) {
    console.error("Error from getNonce:", e);
    res.status(500).json({ message: "Error from getNonce" });
  }
};

export const verifySign = (req: Request, res: Response) => {
  try {
    let { publicKey, signature } = req.body;
    console.log("Received publicKey:", publicKey);
    console.log("Received signature:", signature);
    console.log("Session nonce:", req.session.nonce);
    console.log("Session publicKey:", req.session.publicKey);

    let base58PublicKey: string;
    try {
      base58PublicKey = new PublicKey(publicKey).toBase58();
    } catch (e) {
      return res.status(400).json({ error: "Invalid public Key format" });
    }

    if (!req.session.nonce || !req.session.publicKey) {
      return res.status(401).json({
        error: "Session expired or invalid",
        authenticated: false,
      });
    }

    if (base58PublicKey !== req.session.publicKey) {
      return res.status(401).json({
        error: "The public key used to sign and connect doesn't match",
        authenticated: false,
      });
    }

    const message = new TextEncoder().encode(req.session.nonce);
    let signatureBytes, publicKeyBytes;
    try {
      signatureBytes = bs58.decode(signature);
      publicKeyBytes = bs58.decode(base58PublicKey);
    } catch (e) {
      return res.status(400).json({ error: "Invalid base58 encoding" });
    }

    let isValid = false;
    try {
      isValid = nacl.sign.detached.verify(
        message,
        signatureBytes,
        publicKeyBytes
      );
    } catch (verifyError) {
      console.log("Ed25519 verification failed, trying alternative method");
      console.error("Signature verification error:", verifyError);
    }

    if (!isValid) {
      console.log("Signature verification failed");
      console.log("Message length:", message.length);
      console.log("Signature length:", signatureBytes.length);
      console.log("PublicKey length:", publicKeyBytes.length);

      return res.status(401).json({
        error: "Invalid signature",
        authenticated: false,
      });
    }

    req.session.authenticated = true;

    res.status(200).json({
      message: "Authenticated successfully",
      authenticated: true,
    });
  } catch (error) {
    console.error("Error from verifySign:", error);
    res.status(500).json({
      error: "Internal server error",
      authenticated: false,
    });
  }
};

export const getProfile = (req: Request, res: Response) => {
  res.json({
    hasProfile: req.session.hasProfile,
    authenticated: req.session.authenticated,
  });
  return;
};
export const getAuthStatus = (req: Request, res: Response) => {
  try {
    if (req.session.authenticated) {
      res.status(200).json({
        message: "Authenticated",
        authenticated: true,
      });
    } else {
      res.status(401).json({
        message: "Not authenticated",
        authenticated: false,
      });
    }
  } catch (error) {
    console.error("Error from verifyAuth:", error);
    res.status(500).json({
      message: "Internal server error",
      authenticated: false,
    });
  }
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userInfo = createUserSchema.safeParse(req.body);
    if (!userInfo.success) {
      res.status(401).json({
        Error: userInfo.error,
      });
      return;
    }
    console.log(userInfo.data);

    let { name, tags, publicKey } = userInfo.data;
    let base58PublicKey: string;
    try {
      base58PublicKey = new PublicKey(publicKey).toBase58();
    } catch (e) {
      return res.status(400).json({ error: "Invalid public Key format" });
    }

    const duplicateCheck = await prismaClient.user.findUnique({
      where: {
        publicKey: base58PublicKey,
      },
    });

    if (duplicateCheck) {
      res.json({ message: "Account already exists" });
      return;
    }

    const sanitized = name.trim().toLowerCase().replace(/\s+/g, "_"); // replace spaces
    const suffix = base58PublicKey.slice(0, 4); // or use bs58 hash if you prefer
    const slug = `${sanitized}_${suffix}`;
    const newUser = await prismaClient.user.create({
      data: {
        name,
        tags,
        publicKey: base58PublicKey,
        slug,
      },
      select: {
        slug: true,
      },
    });

    req.session.hasProfile = true;
    res.status(201).json({
      slug,
      message: "Signup successful",
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "Internal server error from signup",
    });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout failed:", err);
      return res.status(500).json({ message: "Logout error" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out" });
  });
};
