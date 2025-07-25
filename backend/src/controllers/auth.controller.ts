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
    req.session.slug = null;

    res.json({ nonce });
  } catch (e) {
    console.error("Error from getNonce:", e);
    res.status(500).json({ error: "Error from getNonce" });
  }
};

export const verifySign = async (req: Request, res: Response) => {
  try {
    let { publicKey, signature } = req.body;

    let base58PublicKey: string;
    try {
      base58PublicKey = new PublicKey(publicKey).toBase58();
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Invalid public Key format", authenticated: false });
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

    let signatureBytes: Uint8Array, publicKeyBytes: Uint8Array;
    try {
      signatureBytes = bs58.decode(signature);
      publicKeyBytes = bs58.decode(base58PublicKey);
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Invalid base58 encoding", authenticated: false });
    }

    const isValid = nacl.sign.detached.verify(
      message,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      return res.status(401).json({
        error: "Invalid signature",
        authenticated: false,
      });
    }

    const user = await prismaClient.user.findUnique({
      where: { publicKey: base58PublicKey },
      select: { slug: true },
    });
    if (user) {
      req.session.hasProfile = true;
      req.session.slug = user.slug;
    } else {
      req.session.hasProfile = false;
      req.session.slug = null;
    }

    req.session.authenticated = true;
    req.session.nonce = "removed";

    return res.status(200).json({
      message: "Authenticated successfully",
      authenticated: true,
      slug: user ? user.slug : null,
    });
  } catch (error) {
    console.error("Error from verifySign:", error);
    return res.status(500).json({
      error: "Internal server error",
      authenticated: false,
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { slug } = req.body;
    console.log("Requesting profile:", slug);
    if (!slug) {
      return res.status(400).json({ error: "Missing slug" });
    }
    const profile = await prismaClient.user.findUnique({
      where: { slug },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    let sessionSlug = null;
    if (req.session?.slug) sessionSlug = req.session.slug;
    return res.status(200).json({ authenticated: true, sessionSlug, profile });
  } catch (err) {
    console.error("Error from getProfile:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const userInfo = createUserSchema.safeParse(req.body);
    if (!userInfo.success) {
      res.status(401).json({
        Error: userInfo.error,
      });
      return;
    }
    // console.log(userInfo.data);

    let { name, tags, publicKey, bio, profilePic, birthDate } = userInfo.data;
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
      res.json({ error: "Account already exists" });
      return;
    }

    const sanitized = name.trim().toLowerCase().replace(/\s+/g, "_"); // replace spaces
    const suffix = base58PublicKey.slice(0, 4); // or use bs58 hash if you prefer
    const slug = `${sanitized}_${suffix}`;
    await prismaClient.user.create({
      data: {
        name,
        tags,
        bio,
        birthDate: birthDate,
        profilePic,
        publicKey: base58PublicKey,
        slug,
      },
    });

    req.session.hasProfile = true;
    req.session.slug = slug;

    res.status(201).json({
      slug,
      message: "Signup successful",
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const checkSessionStatusAndGetSlug = async (
  req: Request,
  res: Response
) => {
  if (req.session.hasProfile && req.session.slug && req.session.authenticated) {
    return res.json({
      authenticated: true,
      hasProfile: true,
      slug: req.session.slug,
    });
  } else {
    return res.json({
      authenticated: false,
      hasProfile: false,
      slug: null,
    });
  }
};
export const checkAuthStatus = (req: Request, res: Response) => {
  res.status(200).json({
    authenticated: true,
  });
};
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout failed:", err);
      return res.status(500).json({ erro: "Logout error" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out" });
  });
};
