import { Request, Response } from "express";
import nacl from "tweetnacl";
import bs58 from "bs58";

export const getNonce = (req: Request, res: Response) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) return res.status(400).json({ error: "Missing address" });

    const nonce = `Sign this message to login: ${Math.floor(
      Math.random() * 1000000
    )}`;

    req.session.nonce = nonce;
    req.session.publicKey = publicKey;
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
    const { publicKey, signature } = req.body;
    console.log("Received publicKey:", publicKey);
    console.log("Received signature:", signature);
    console.log("Session nonce:", req.session.nonce);
    console.log("Session publicKey:", req.session.publicKey);

    if (!req.session.nonce || !req.session.publicKey) {
      return res.status(401).json({
        error: "Session expired or invalid",
        authenticated: false,
      });
    }

    if (publicKey !== req.session.publicKey) {
      return res.status(401).json({
        error: "The public key used to sign and connect doesn't match",
        authenticated: false,
      });
    }

    const message = new TextEncoder().encode(req.session.nonce);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(publicKey);

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

export const createProfile = (req: Request, res: Response) => {
  res.json({
    hasProfile: req.session.hasProfile,
    authenticated: req.session.authenticated,
  });
  return;
};
